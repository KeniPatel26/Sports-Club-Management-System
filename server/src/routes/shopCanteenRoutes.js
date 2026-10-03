import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  createOrder,
  getOrders,
  settleTab,
} from '../controllers/shopCanteenController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/products', getProducts);
router.post('/products', protect, authorize('OWNER', 'SHOP_STAFF', 'CANTEEN_STAFF'), createProduct);
router.put('/products/:id', protect, authorize('OWNER', 'SHOP_STAFF', 'CANTEEN_STAFF'), updateProduct);

router.post('/orders', protect, createOrder);
router.get('/orders', protect, getOrders);
router.patch('/orders/:id/settle-tab', protect, authorize('OWNER', 'CANTEEN_STAFF'), settleTab);

export default router;
