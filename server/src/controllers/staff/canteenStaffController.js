import Product from '../../models/Product.js';
import DiningTable from '../../models/DiningTable.js';
import Order from '../../models/Order.js';
import Payment from '../../models/Payment.js';
import Invoice from '../../models/Invoice.js';
import User from '../../models/User.js';
import Membership from '../../models/Membership.js';

/**
 * GET /api/staff/canteen/overview
 * Canteen KPIs & Live Kitchen Queue
 */
export const getCanteenOverview = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const activeOrders = await Order.find({
      type: 'canteen',
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] },
    })
      .populate('member', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    const occupiedTablesCount = await DiningTable.countDocuments({
      status: 'OCCUPIED',
    });

    const [newOrdersCount, servedCount, openTabsCount, pendingBillsCount, completedToday, cancelledToday, collectedToday] = await Promise.all([
      Order.countDocuments({ type: 'canteen', status: 'pending' }),
      Order.countDocuments({ type: 'canteen', status: 'completed', updatedAt: { $gte: todayStart } }),
      Order.countDocuments({ type: 'canteen', tabStatus: 'OPEN', paymentStatus: 'pending' }),
      Order.countDocuments({ type: 'canteen', paymentStatus: 'pending', isTab: false }),
      Order.countDocuments({ type: 'canteen', status: 'completed', updatedAt: { $gte: todayStart } }),
      Order.countDocuments({ type: 'canteen', status: 'cancelled', updatedAt: { $gte: todayStart } }),
      Payment.aggregate([
        { $match: { type: 'CANTEEN', status: 'SUCCESS', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const preparingCount = activeOrders.filter((o) => o.status === 'preparing').length;
    const readyCount = activeOrders.filter((o) => o.status === 'ready').length;

    return res.status(200).json({
      success: true,
      data: {
        kpi: {
          activeOrdersCount: activeOrders.length,
          preparingCount,
          readyCount,
          occupiedTablesCount,
          newOrdersCount,
          servedCount,
          openTabsCount,
          pendingBillsCount,
          completedToday,
          cancelledToday,
          collectedToday: collectedToday[0]?.total || 0,
        },
        liveKitchenQueue: activeOrders,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch canteen overview',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/canteen/tables
 * Visual Table status layout
 */
export const getDiningTables = async (req, res) => {
  try {
    const tables = await DiningTable.find().sort({ tableNumber: 1 });

    return res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tables',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/staff/canteen/tables/:id/status
 * Seat customer or mark table cleaning / available
 */
export const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, customerName, phone } = req.body;

    const table = await DiningTable.findById(id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    table.status = status;
    if (customerName) {
      table.currentCustomer = { name: customerName, phone: phone || '' };
    } else if (status === 'AVAILABLE') {
      table.currentCustomer = { name: '', phone: '' };
      table.activeOrderId = null;
    }

    await table.save();

    return res.status(200).json({
      success: true,
      message: `Table ${table.tableNumber} updated to ${status}`,
      data: table,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update table status',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/canteen/menu
 * View canteen menu
 */
export const getCanteenMenu = async (req, res) => {
  try {
    const items = await Product.find({ type: 'canteen' }).sort({ category: 1, name: 1 });
    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch menu',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/staff/canteen/menu/:id/toggle-availability
 * Staff toggles dish availability (available / out of stock)
 */
export const toggleItemAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Product.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    return res.status(200).json({
      success: true,
      message: `${item.name} is now ${item.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}`,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle availability',
      error: error.message,
    });
  }
};

/**
 * POST /api/staff/canteen/orders
 * Kitchen order creation or adding to member running tab
 */
export const createCanteenOrder = async (req, res) => {
  try {
    const {
      tableNumber,
      memberId,
      customerName = 'Walk-in Customer',
      customerPhone = '',
      items = [],
      isTab = false,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const quantitiesByProduct = new Map();
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Enter a valid item quantity.' });
      }
      const productId = String(item.productId || item.product || '');
      const itemTotal = (quantitiesByProduct.get(productId) || 0) + quantity;
      if (itemTotal > 10) {
        return res.status(400).json({ success: false, message: 'Maximum 10 quantities allowed for one item.' });
      }
      quantitiesByProduct.set(productId, itemTotal);
    }

    let subtotal = 0;
    const orderItems = [];

    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod || prod.type !== 'canteen' || !prod.isAvailable) {
        return res.status(400).json({ success: false, message: 'One or more menu items are unavailable.' });
      }
      subtotal += prod.price * Number(it.quantity);
      orderItems.push({
        product: prod._id,
        name: prod.name,
        quantity: Number(it.quantity),
        price: prod.price,
      });
    }

    let discountPercent = 0;
    let memberUser = null;

    if (memberId) {
      memberUser = await User.findById(memberId);
      if (memberUser) {
        const activeMembership = await Membership.findOne({
          $or: [{ user: memberUser._id }, { member: memberUser._id }],
          status: 'ACTIVE',
        }).populate('plan');

        discountPercent = activeMembership?.plan?.benefits?.cafeDiscount
          ?? activeMembership?.plan?.benefits?.canteenDiscount
          ?? activeMembership?.plan?.cafeDiscount
          ?? activeMembership?.plan?.canteenDiscount
          ?? 0;
      }
    }

    const discount = Math.round((subtotal * discountPercent) / 100);
    const total = Math.max(subtotal - discount, 0);

    const order = await Order.create({
      member: memberUser ? memberUser._id : null,
      customerName: memberUser ? `${memberUser.firstName} ${memberUser.lastName}`.trim() : customerName,
      customerPhone: memberUser ? memberUser.phone : customerPhone,
      items: orderItems,
      type: 'canteen',
      subtotal,
      discount,
      total,
      fulfillment: tableNumber ? 'table' : 'counter',
      tableNumber: tableNumber || '',
      isTab: Boolean(isTab),
      tabStatus: isTab ? 'OPEN' : 'CLOSED',
      paymentMethod: 'tab',
      paymentStatus: 'pending',
      status: 'pending',
    });

    if (tableNumber) {
      await DiningTable.findOneAndUpdate(
        { tableNumber },
        {
          status: 'OCCUPIED',
          currentCustomer: { name: order.customerName, phone: order.customerPhone },
          activeOrderId: order._id,
        }
      );
    }

    return res.status(201).json({
      success: true,
      message: `Kitchen order #${order._id.toString().slice(-4)} created!`,
      data: order,
    });
  } catch (error) {
    console.error('createCanteenOrder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create canteen order',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/staff/canteen/orders/:id/status
 * Kitchen pipeline: pending ➔ confirmed ➔ preparing ➔ ready ➔ completed
 */
export const updateCanteenOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const transitions = {
      pending: ['preparing', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['completed', 'cancelled'],
    };
    if (!transitions[order.status]?.includes(status)) {
      return res.status(400).json({ success: false, message: 'This order status change is not allowed.' });
    }
    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Kitchen order #${id.slice(-4)} status updated to ${status.toUpperCase()}`,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

/**
 * POST /api/staff/canteen/tabs/settle
 * Settle running tab bill & free table
 */
export const settleCanteenTab = async (req, res) => {
  try {
    const { orderId, tableNumber, paymentMethod = 'UPI' } = req.body;
    const method = String(paymentMethod).toUpperCase();
    if (!['UPI', 'CARD', 'CASH'].includes(method)) {
      return res.status(400).json({ success: false, message: 'Choose Cash, Card, or UPI.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tab not found' });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This order has already been paid.' });
    }

    order.tabStatus = 'CLOSED';
    order.paymentStatus = 'paid';
    order.paymentMethod = method.toLowerCase();
    await order.save();

    // Record invoice & payment
    const invoiceNumber = `INV-CAN-${Date.now().toString().slice(-6)}`;
    const invoice = await Invoice.create({
      invoiceNumber,
      user: order.member || null,
      customerName: order.customerName,
      type: 'CANTEEN',
      items: order.items.map((i) => ({
        description: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
        amount: i.price * i.quantity,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      totalAmount: order.total,
      paymentStatus: 'PAID',
      paymentMethod: method,
    });

    const payment = await Payment.create({
      paymentId: `PAY-CAN-${Date.now().toString().slice(-6)}`,
      user: order.member || null,
      customerName: order.customerName,
      type: 'CANTEEN',
      amount: order.total,
      method,
      status: 'SUCCESS',
      referenceId: invoiceNumber,
      notes: `Canteen settlement for Table ${order.tableNumber || 'Counter'}`,
    });

    return res.status(200).json({
      success: true,
      message: `Payment of ₹${order.total} received successfully.`,
      data: { order, invoice, payment },
    });
  } catch (error) {
    console.error('settleCanteenTab error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to settle tab',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/canteen/orders
 * List orders by status (all, new/pending, preparing, ready, completed)
 */
export const getCanteenOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { type: 'canteen' };

    if (status && status !== 'ALL') {
      query.status = status.toLowerCase();
    }

    const orders = await Order.find(query)
      .populate('member', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch canteen orders',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/canteen/tabs/open
 * List open running table tabs
 */
export const getOpenTabs = async (req, res) => {
  try {
    const openOrders = await Order.find({
      type: 'canteen',
      tabStatus: 'OPEN',
      paymentStatus: 'pending',
    })
      .populate('member', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: openOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch open tabs',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/canteen/payments
 * View payments and settled bills in Canteen
 */
export const getCanteenPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ type: 'CANTEEN' })
      .sort({ createdAt: -1 })
      .limit(40);

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch canteen payments',
      error: error.message,
    });
  }
};

export default {
  getCanteenOverview,
  getDiningTables,
  updateTableStatus,
  getCanteenMenu,
  toggleItemAvailability,
  createCanteenOrder,
  updateCanteenOrderStatus,
  settleCanteenTab,
  getCanteenOrders,
  getOpenTabs,
  getCanteenPayments,
};
