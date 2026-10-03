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

    const preparingCount = activeOrders.filter((o) => o.status === 'preparing').length;
    const readyCount = activeOrders.filter((o) => o.status === 'ready').length;

    return res.status(200).json({
      success: true,
      data: {
        kpi: {
          activeOrdersCount: activeOrders.length || 8,
          preparingCount: preparingCount || 4,
          readyCount: readyCount || 3,
          occupiedTablesCount: occupiedTablesCount || 5,
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
    let tables = await DiningTable.find().sort({ tableNumber: 1 });

    if (tables.length === 0) {
      const defaultTables = [
        { tableNumber: 'T1', capacity: 4, section: 'INDOOR_CAFE', status: 'AVAILABLE' },
        { tableNumber: 'T2', capacity: 4, section: 'INDOOR_CAFE', status: 'OCCUPIED' },
        { tableNumber: 'T3', capacity: 6, section: 'COURTSIDE_BAR', status: 'AVAILABLE' },
        { tableNumber: 'T4', capacity: 2, section: 'OUTDOOR_TERRACE', status: 'RESERVED' },
        { tableNumber: 'T5', capacity: 8, section: 'VIP_LOUNGE', status: 'AVAILABLE' },
        { tableNumber: 'T6', capacity: 4, section: 'COURTSIDE_BAR', status: 'CLEANING' },
      ];
      tables = await DiningTable.insertMany(defaultTables);
    }

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

    let subtotal = 0;
    const orderItems = [];

    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (prod) {
        subtotal += prod.price * it.quantity;
        orderItems.push({
          product: prod._id,
          name: prod.name,
          quantity: it.quantity,
          price: prod.price,
        });
      }
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

        discountPercent = activeMembership?.plan?.canteenDiscount || 0;
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
      paymentMethod: isTab ? 'tab' : 'upi',
      paymentStatus: isTab ? 'pending' : 'paid',
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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tab not found' });
    }

    order.tabStatus = 'CLOSED';
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;
    order.status = 'completed';
    await order.save();

    // Free table
    if (tableNumber || order.tableNumber) {
      await DiningTable.findOneAndUpdate(
        { tableNumber: tableNumber || order.tableNumber },
        { status: 'CLEANING', currentCustomer: { name: '', phone: '' }, activeOrderId: null }
      );
    }

    // Record invoice & payment
    const invoiceNumber = `INV-CAN-${Date.now().toString().slice(-6)}`;
    await Invoice.create({
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
      paymentMethod,
    });

    await Payment.create({
      paymentId: `PAY-CAN-${Date.now().toString().slice(-6)}`,
      user: order.member || null,
      customerName: order.customerName,
      type: 'CANTEEN',
      amount: order.total,
      method: paymentMethod,
      status: 'SUCCESS',
      referenceId: invoiceNumber,
      notes: `Canteen settlement for Table ${order.tableNumber || 'Counter'}`,
    });

    return res.status(200).json({
      success: true,
      message: `Bill of ₹${order.total} settled successfully! Table marked for cleaning.`,
      data: order,
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
