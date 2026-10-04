import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/authorizationMiddleware.js';
import { hasPermission } from '../utils/permissions.js';

import {
  getMyStaffProfile,
  staffCheckIn,
  staffCheckOut,
  getStaffNotifications,
} from '../controllers/staff/staffCommonController.js';
import {
  getFrontDeskOverview,
  searchMembers,
  createFrontDeskBooking,
  checkInBooking,
  checkOutBooking,
  updateBookingStatus,
  getCourtAvailability,
  rescheduleBooking,
  cancelBooking,
  collectBookingPayment,
  getMemberHistory,
  getFrontDeskPayments,
  getDailyClosingSummary,
  submitDailyClosingReport,
} from '../controllers/staff/frontDeskController.js';
import {
  getPlans,
  getMembershipsList,
  assignOrRenewMembership,
} from '../controllers/manager/managerMembershipController.js';
import {
  getShopOverview,
  getShopProducts,
  createShopProduct,
  updateShopProduct,
  archiveShopProduct,
  receiveStock,
  adjustStock,
  reportDamage,
  getInventoryHistory,
  processCounterSale,
  getShopOrders,
  getShopPayments,
  updateShopOrderStatus,
  processOrderReturn,
  reportLowStock,
} from '../controllers/staff/sportsShopController.js';
import {
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
} from '../controllers/staff/canteenStaffController.js';

const router = express.Router();

// ============================================
// COMMON STAFF (ALL DEPARTMENTS)
// ============================================
router.get('/profile', authenticate, getMyStaffProfile);
router.post('/check-in', authenticate, staffCheckIn);
router.post('/check-out', authenticate, staffCheckOut);
router.get('/notifications', authenticate, getStaffNotifications);

// ============================================
// 1. FRONT DESK STAFF
// ============================================
router.get(
  '/front-desk/overview',
  authenticate,
  requirePermission('BOOKING_VIEW'),
  getFrontDeskOverview
);
router.get(
  '/front-desk/courts/availability',
  authenticate,
  requirePermission('COURT_VIEW'),
  getCourtAvailability
);
router.get(
  '/front-desk/members/search',
  authenticate,
  (req, res, next) => {
    if (hasPermission(req.user, 'MEMBER_VIEW') || hasPermission(req.user, 'CANTEEN_ORDER_MANAGE')) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'You do not have permission to search members' });
  },
  searchMembers
);
router.get(
  '/front-desk/members/:id/history',
  authenticate,
  requirePermission('MEMBER_VIEW'),
  getMemberHistory
);
router.post(
  '/front-desk/bookings',
  authenticate,
  requirePermission('BOOKING_CREATE'),
  createFrontDeskBooking
);
router.post(
  '/front-desk/bookings/:id/check-in',
  authenticate,
  requirePermission('BOOKING_UPDATE'),
  checkInBooking
);
router.post(
  '/front-desk/bookings/:id/check-out',
  authenticate,
  requirePermission('BOOKING_UPDATE'),
  checkOutBooking
);
router.patch(
  '/front-desk/bookings/:id/status',
  authenticate,
  requirePermission('BOOKING_UPDATE'),
  updateBookingStatus
);
router.patch(
  '/front-desk/bookings/:id/reschedule',
  authenticate,
  requirePermission('BOOKING_UPDATE'),
  rescheduleBooking
);
router.post(
  '/front-desk/bookings/:id/cancel',
  authenticate,
  requirePermission('BOOKING_CANCEL'),
  cancelBooking
);
router.post(
  '/front-desk/bookings/:id/collect-payment',
  authenticate,
  requirePermission('PAYMENT_CREATE'),
  collectBookingPayment
);
router.get(
  '/front-desk/payments',
  authenticate,
  requirePermission('PAYMENT_VIEW'),
  getFrontDeskPayments
);
router.get(
  '/front-desk/daily-closing',
  authenticate,
  requirePermission('BOOKING_VIEW'),
  getDailyClosingSummary
);
router.post(
  '/front-desk/daily-closing',
  authenticate,
  requirePermission('BOOKING_UPDATE'),
  submitDailyClosingReport
);

// Front Desk Counter Memberships
router.get(
  '/front-desk/memberships/plans',
  authenticate,
  requirePermission('MEMBERSHIP_VIEW'),
  getPlans
);
router.get(
  '/front-desk/memberships/list',
  authenticate,
  requirePermission('MEMBERSHIP_VIEW'),
  getMembershipsList
);
router.post(
  '/front-desk/memberships/assign',
  authenticate,
  requirePermission('MEMBERSHIP_CREATE'),
  assignOrRenewMembership
);

// ============================================
// 2. SPORTS SHOP STAFF
// ============================================
router.get(
  '/sports-shop/overview',
  authenticate,
  requirePermission('PRODUCT_VIEW'),
  getShopOverview
);
router.get(
  '/sports-shop/products',
  authenticate,
  requirePermission('PRODUCT_VIEW'),
  getShopProducts
);
router.post(
  '/sports-shop/products',
  authenticate,
  requirePermission('PRODUCT_CREATE'),
  createShopProduct
);
router.patch(
  '/sports-shop/products/:id',
  authenticate,
  requirePermission('PRODUCT_UPDATE'),
  updateShopProduct
);
router.delete(
  '/sports-shop/products/:id',
  authenticate,
  requirePermission('PRODUCT_DELETE'),
  archiveShopProduct
);
router.post(
  '/sports-shop/inventory/receive',
  authenticate,
  requirePermission('INVENTORY_MANAGE'),
  receiveStock
);
router.post(
  '/sports-shop/inventory/adjust',
  authenticate,
  requirePermission('INVENTORY_MANAGE'),
  adjustStock
);
router.post(
  '/sports-shop/inventory/damage',
  authenticate,
  requirePermission('INVENTORY_MANAGE'),
  reportDamage
);
router.get(
  '/sports-shop/inventory/history',
  authenticate,
  requirePermission('INVENTORY_VIEW'),
  getInventoryHistory
);
router.post(
  '/sports-shop/pos/checkout',
  authenticate,
  requirePermission('SHOP_ORDER_MANAGE'),
  processCounterSale
);
router.get(
  '/sports-shop/orders',
  authenticate,
  requirePermission('SHOP_ORDER_VIEW'),
  getShopOrders
);
router.patch(
  '/sports-shop/orders/:id/status',
  authenticate,
  requirePermission('SHOP_ORDER_MANAGE'),
  updateShopOrderStatus
);
router.post(
  '/sports-shop/orders/:id/return',
  authenticate,
  requirePermission('SHOP_ORDER_MANAGE'),
  processOrderReturn
);
router.get(
  '/sports-shop/payments',
  authenticate,
  requirePermission('PAYMENT_CREATE'),
  getShopPayments
);
router.post(
  '/sports-shop/report-low-stock',
  authenticate,
  requirePermission('INVENTORY_VIEW'),
  reportLowStock
);


// ============================================
// 3. CANTEEN & BAR STAFF
// ============================================
router.get(
  '/canteen/overview',
  authenticate,
  requirePermission('CANTEEN_ORDER_VIEW'),
  getCanteenOverview
);
router.get(
  '/canteen/tables',
  authenticate,
  requirePermission('TABLE_VIEW'),
  getDiningTables
);
router.patch(
  '/canteen/tables/:id/status',
  authenticate,
  requirePermission('TABLE_MANAGE'),
  updateTableStatus
);
router.get(
  '/canteen/menu',
  authenticate,
  requirePermission('MENU_VIEW'),
  getCanteenMenu
);
router.patch(
  '/canteen/menu/:id/toggle-availability',
  authenticate,
  requirePermission('MENU_MANAGE'),
  toggleItemAvailability
);
router.post(
  '/canteen/orders',
  authenticate,
  requirePermission('CANTEEN_ORDER_MANAGE'),
  createCanteenOrder
);
router.get(
  '/canteen/orders',
  authenticate,
  requirePermission('CANTEEN_ORDER_VIEW'),
  getCanteenOrders
);
router.patch(
  '/canteen/orders/:id/status',
  authenticate,
  requirePermission('CANTEEN_ORDER_MANAGE'),
  updateCanteenOrderStatus
);
router.get(
  '/canteen/tabs/open',
  authenticate,
  requirePermission('BILL_MANAGE'),
  getOpenTabs
);
router.post(
  '/canteen/tabs/settle',
  authenticate,
  requirePermission('BILL_MANAGE'),
  settleCanteenTab
);
router.get(
  '/canteen/payments',
  authenticate,
  requirePermission('PAYMENT_CREATE'),
  getCanteenPayments
);

export default router;
