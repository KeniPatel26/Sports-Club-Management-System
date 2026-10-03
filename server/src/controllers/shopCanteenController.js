import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Membership from '../models/Membership.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

/**
 * @desc    Get products by type ('sports' or 'canteen')
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { type, category, search } = req.query;
    const query = { isAvailable: true };

    if (type) query.type = type;
    if (category && category !== 'ALL') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort({ category: 1, name: 1 });
    return sendSuccess(res, {
      message: 'Products fetched successfully',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create product (Owner or Shop/Canteen Staff)
 * @route   POST /api/products
 * @access  Private (Staff/Owner)
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, type, category, price, image, stock, lowStockThreshold } = req.body;

    if (!name || !type || price === undefined) {
      return sendError(res, { statusCode: 400, message: 'Name, type, and price are required' });
    }

    const product = await Product.create({
      name,
      type,
      category: category || 'General',
      price,
      image: image || '',
      stock: stock || 0,
      lowStockThreshold: lowStockThreshold || 5,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Product added successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product stock / details
 * @route   PUT /api/products/:id
 * @access  Private (Staff/Owner)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return sendError(res, { statusCode: 404, message: 'Product not found' });
    }

    return sendSuccess(res, {
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Place order / counter sale / bar order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      memberId,
      customerName,
      customerPhone,
      items = [],
      type = 'sports',
      fulfillment = 'counter',
      tableNumber,
      isTab = false,
      deliveryAddress,
      paymentMethod = 'upi',
    } = req.body;

    if (!items || items.length === 0) {
      return sendError(res, { statusCode: 400, message: 'Order must contain at least one item' });
    }

    let subtotal = 0;
    const validatedItems = [];

    // Verify stock & calculate subtotal
    for (const item of items) {
      const product = await Product.findById(item.product || item.productId);
      if (!product) {
        return sendError(res, { statusCode: 404, message: `Product ${item.name || ''} not found` });
      }

      if (product.stock < item.quantity) {
        return sendError(res, {
          statusCode: 400,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }

      // Deduct stock from unified shelf inventory
      product.stock -= item.quantity;
      await product.save();

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Check member plan discount
    const targetUserId = memberId || (req.user?.role === 'MEMBER' ? req.user._id : null);
    let discount = 0;

    if (targetUserId) {
      const membership = await Membership.findOne({ member: targetUserId, status: 'ACTIVE' }).populate('plan');
      if (membership?.plan) {
        const plan = membership.plan;
        const discountRate = type === 'sports' ? plan.shopDiscount : plan.canteenDiscount;
        if (discountRate > 0) {
          discount = (subtotal * discountRate) / 100;
        }
      }
    }

    const total = Math.max(0, subtotal - discount);

    const order = await Order.create({
      member: targetUserId,
      customerName: customerName || req.user?.name || 'Customer',
      customerPhone: customerPhone || req.user?.phone || '',
      items: validatedItems,
      type,
      subtotal,
      discount,
      total,
      fulfillment,
      tableNumber: tableNumber || '',
      isTab,
      tabStatus: isTab ? 'OPEN' : 'CLOSED',
      deliveryAddress: deliveryAddress || '',
      paymentMethod,
      paymentStatus: isTab ? 'pending' : 'paid',
      status: 'confirmed',
    });

    await logActivity({
      userId: req.user._id,
      action: `Created ${type} order #${order._id.toString().slice(-6)} (Total: ₹${total})`,
      entity: 'Order',
      entityId: order._id,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders (Filter by type: 'sports' or 'canteen', or member)
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = async (req, res, next) => {
  try {
    const { type, isTab, status } = req.query;
    const query = {};

    if (req.user.role === 'MEMBER') {
      query.member = req.user._id;
    }

    if (type) query.type = type;
    if (isTab !== undefined) query.isTab = isTab === 'true';
    if (status && status !== 'ALL') query.status = status;

    const orders = await Order.find(query)
      .populate('member', 'firstName lastName email phone')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      message: 'Orders fetched successfully',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close bar tab and settle bill
 * @route   PATCH /api/orders/:id/settle-tab
 * @access  Private (Canteen/Owner)
 */
export const settleTab = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return sendError(res, { statusCode: 404, message: 'Order tab not found' });
    }

    order.tabStatus = 'CLOSED';
    order.paymentStatus = 'paid';
    order.status = 'completed';
    await order.save();

    return sendSuccess(res, {
      message: `Table tab settled and marked paid (₹${order.total})`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProducts,
  createProduct,
  updateProduct,
  createOrder,
  getOrders,
  settleTab,
};
