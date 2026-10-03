import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import InventoryTransaction from '../../models/InventoryTransaction.js';

/**
 * GET /api/manager/shop/products
 * List pro-shop gear products
 */
export const getProducts = async (req, res) => {
  try {
    const { category, lowStock, search = '' } = req.query;

    const query = { type: 'sports' };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    }

    if (search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const products = await Product.find(query).sort({ stock: 1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shop products',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/shop/products
 * Create a new product in the Pro Shop
 */
export const createProduct = async (req, res) => {
  try {
    const { name, category = 'General', price, stock = 10, lowStockThreshold = 5, image = '' } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      type: 'sports',
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      isAvailable: true,
      image,
    });

    // Record initial stock inventory transaction
    await InventoryTransaction.create({
      product: product._id,
      type: 'PURCHASE',
      quantity: Number(stock),
      previousStock: 0,
      newStock: Number(stock),
      notes: 'Initial product stock creation',
      performedBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

/**
 * PUT /api/manager/shop/products/:id
 * Update product details & price
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/shop/inventory/adjust
 * Record stock replenishment or damage adjustment with audit log
 */
export const adjustStock = async (req, res) => {
  try {
    const { productId, type = 'PURCHASE', quantity, notes = '' } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const qty = Number(quantity);
    const prevStock = product.stock;
    let newStock = prevStock;

    if (type === 'PURCHASE' || type === 'RETURN') {
      newStock += qty;
    } else if (type === 'DAMAGE' || type === 'COUNTER_SALE' || type === 'ONLINE_SALE') {
      newStock = Math.max(prevStock - qty, 0);
    } else if (type === 'ADJUSTMENT') {
      newStock = qty; // direct override
    }

    product.stock = newStock;
    await product.save();

    const transaction = await InventoryTransaction.create({
      product: product._id,
      type,
      quantity: qty,
      previousStock: prevStock,
      newStock,
      notes,
      performedBy: req.user?._id || null,
    });

    return res.status(200).json({
      success: true,
      message: `Stock updated for ${product.name}: ${prevStock} ➔ ${newStock}`,
      data: { product, transaction },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to adjust stock',
      error: error.message,
    });
  }
};

/**
 * GET /api/manager/shop/inventory/logs
 * List inventory audit transactions
 */
export const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryTransaction.find()
      .populate('product', 'name category price')
      .populate('performedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory logs',
      error: error.message,
    });
  }
};

/**
 * GET /api/manager/shop/orders
 * List sports gear orders
 */
export const getShopOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { type: 'sports' };
    if (status && status !== 'ALL') query.status = status;

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
      message: 'Failed to fetch shop orders',
      error: error.message,
    });
  }
};

export default {
  getProducts,
  createProduct,
  updateProduct,
  adjustStock,
  getInventoryLogs,
  getShopOrders,
};
