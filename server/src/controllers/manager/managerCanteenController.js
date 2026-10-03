import Product from '../../models/Product.js';
import DiningTable from '../../models/DiningTable.js';
import Order from '../../models/Order.js';

/**
 * GET /api/manager/canteen/menu
 * List cafeteria & bar menu items
 */
export const getMenu = async (req, res) => {
  try {
    const { category, search = '' } = req.query;

    const query = { type: 'canteen' };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const items = await Product.find(query).sort({ category: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch canteen menu',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/canteen/menu
 * Create a new dish/drink on the menu
 */
export const createMenuItem = async (req, res) => {
  try {
    const { name, category = 'Snacks', price, isAvailable = true, image = '' } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item name and price are required',
      });
    }

    const item = await Product.create({
      name: name.trim(),
      type: 'canteen',
      category: category.trim(),
      price: Number(price),
      isAvailable: Boolean(isAvailable),
      image,
      stock: 100, // cafe default ready stock
    });

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message,
    });
  }
};

/**
 * PUT /api/manager/canteen/menu/:id
 * Update menu item details & price
 */
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message,
    });
  }
};

// ============================================
// TABLES
// ============================================

export const getTables = async (req, res) => {
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

export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, section } = req.body;
    const table = await DiningTable.create({
      tableNumber,
      capacity: Number(capacity) || 4,
      section: section || 'INDOOR_CAFE',
      status: 'AVAILABLE',
    });

    return res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: table,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create table',
      error: error.message,
    });
  }
};

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
      message: `Table ${table.tableNumber} status updated to ${status}`,
      data: table,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update table',
      error: error.message,
    });
  }
};

// ============================================
// ORDERS & TABS
// ============================================

export const getCanteenOrders = async (req, res) => {
  try {
    const { status, isTab } = req.query;
    const query = { type: 'canteen' };

    if (status && status !== 'ALL') query.status = status;
    if (isTab === 'true') query.isTab = true;

    const orders = await Order.find(query)
      .populate('member', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

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

export default {
  getMenu,
  createMenuItem,
  updateMenuItem,
  getTables,
  createTable,
  updateTableStatus,
  getCanteenOrders,
};
