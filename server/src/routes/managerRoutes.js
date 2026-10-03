import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/authorizationMiddleware.js';

import { getDashboardOverview } from '../controllers/manager/managerDashboardController.js';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  toggleMemberStatus,
} from '../controllers/manager/managerMemberController.js';
import {
  getPlans,
  createPlan,
  updatePlan,
  getMembershipsList,
  assignOrRenewMembership,
} from '../controllers/manager/managerMembershipController.js';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  getShifts,
  createShift,
  getTodayAttendance,
  recordAttendance,
  getLeaveRequests,
  updateLeaveStatus,
  getPayroll,
  markPayrollPaid,
} from '../controllers/manager/managerEmployeeController.js';
import {
  getCourts,
  createCourt,
  updateCourt,
  toggleCourtMaintenance,
  getBookings,
  cancelBooking,
} from '../controllers/manager/managerCourtController.js';
import {
  getProducts,
  createProduct,
  updateProduct,
  adjustStock,
  getInventoryLogs,
  getShopOrders,
} from '../controllers/manager/managerShopController.js';
import {
  getMenu,
  createMenuItem,
  updateMenuItem,
  getTables,
  createTable,
  updateTableStatus,
  getCanteenOrders,
} from '../controllers/manager/managerCanteenController.js';
import {
  getFinancialOverview,
  getPayments,
  getInvoices,
  getExpenses,
  createExpense,
} from '../controllers/manager/managerFinanceController.js';
import { getFullReport } from '../controllers/manager/managerReportController.js';
import {
  getLeads,
  createLead,
  updateLeadStatus,
} from '../controllers/manager/managerLeadController.js';
import {
  getSettings,
  updateSettings,
} from '../controllers/manager/managerSettingController.js';

const router = express.Router();

// ============================================
// 1. DASHBOARD OVERVIEW
// ============================================
router.get('/dashboard', authenticate, requirePermission('MEMBER_VIEW'), getDashboardOverview);
router.get('/dashboard/overview', authenticate, requirePermission('MEMBER_VIEW'), getDashboardOverview);
router.get('/overview', authenticate, requirePermission('MEMBER_VIEW'), getDashboardOverview);

// ============================================
// 2. MEMBER MANAGEMENT
// ============================================
router.get('/members', authenticate, requirePermission('MEMBER_VIEW'), getMembers);
router.get('/members/:id', authenticate, requirePermission('MEMBER_VIEW'), getMemberById);
router.post('/members', authenticate, requirePermission('MEMBER_CREATE'), createMember);
router.put('/members/:id', authenticate, requirePermission('MEMBER_UPDATE'), updateMember);
router.patch('/members/:id/toggle-status', authenticate, requirePermission('MEMBER_DELETE'), toggleMemberStatus);

// ============================================
// 3. MEMBERSHIP MANAGEMENT
// ============================================
router.get('/memberships/plans', authenticate, requirePermission('MEMBERSHIP_VIEW'), getPlans);
router.post('/memberships/plans', authenticate, requirePermission('MEMBERSHIP_CREATE'), createPlan);
router.put('/memberships/plans/:id', authenticate, requirePermission('MEMBERSHIP_UPDATE'), updatePlan);
router.get('/memberships/list', authenticate, requirePermission('MEMBERSHIP_VIEW'), getMembershipsList);
router.post('/memberships/assign', authenticate, requirePermission('MEMBERSHIP_CREATE'), assignOrRenewMembership);

// ============================================
// 4. EMPLOYEE MANAGEMENT
// ============================================
router.get('/employees', authenticate, requirePermission('EMPLOYEE_VIEW'), getEmployees);
router.post('/employees', authenticate, requirePermission('EMPLOYEE_CREATE'), createEmployee);
router.put('/employees/:id', authenticate, requirePermission('EMPLOYEE_UPDATE'), updateEmployee);

router.get('/employees/shifts/all', authenticate, requirePermission('SHIFT_VIEW'), getShifts);
router.post('/employees/shifts', authenticate, requirePermission('SHIFT_MANAGE'), createShift);

router.get('/employees/attendance/today', authenticate, requirePermission('ATTENDANCE_VIEW'), getTodayAttendance);
router.post('/employees/attendance/record', authenticate, requirePermission('ATTENDANCE_MANAGE'), recordAttendance);

router.get('/employees/leave/all', authenticate, requirePermission('LEAVE_VIEW'), getLeaveRequests);
router.patch('/employees/leave/:id', authenticate, requirePermission('LEAVE_MANAGE'), updateLeaveStatus);

router.get('/employees/payroll/all', authenticate, requirePermission('SALARY_VIEW'), getPayroll);
router.post('/employees/payroll/pay', authenticate, requirePermission('SALARY_MANAGE'), markPayrollPaid);

// ============================================
// 5. COURT MANAGEMENT
// ============================================
router.get('/courts', authenticate, requirePermission('COURT_VIEW'), getCourts);
router.post('/courts', authenticate, requirePermission('COURT_CREATE'), createCourt);
router.put('/courts/:id', authenticate, requirePermission('COURT_UPDATE'), updateCourt);
router.patch('/courts/:id/maintenance', authenticate, requirePermission('COURT_UPDATE'), toggleCourtMaintenance);
router.get('/courts/bookings/all', authenticate, requirePermission('BOOKING_VIEW'), getBookings);
router.patch('/courts/bookings/:id/cancel', authenticate, requirePermission('BOOKING_CANCEL'), cancelBooking);

// ============================================
// 6. SPORTS SHOP
// ============================================
router.get('/shop/products', authenticate, requirePermission('PRODUCT_VIEW'), getProducts);
router.post('/shop/products', authenticate, requirePermission('PRODUCT_CREATE'), createProduct);
router.put('/shop/products/:id', authenticate, requirePermission('PRODUCT_UPDATE'), updateProduct);
router.post('/shop/inventory/adjust', authenticate, requirePermission('INVENTORY_MANAGE'), adjustStock);
router.get('/shop/inventory/logs', authenticate, requirePermission('INVENTORY_VIEW'), getInventoryLogs);
router.get('/shop/orders', authenticate, requirePermission('SHOP_ORDER_VIEW'), getShopOrders);

// ============================================
// 7. CANTEEN & BAR
// ============================================
router.get('/canteen/menu', authenticate, requirePermission('MENU_VIEW'), getMenu);
router.post('/canteen/menu', authenticate, requirePermission('MENU_MANAGE'), createMenuItem);
router.put('/canteen/menu/:id', authenticate, requirePermission('MENU_MANAGE'), updateMenuItem);
router.get('/canteen/tables', authenticate, requirePermission('TABLE_VIEW'), getTables);
router.post('/canteen/tables', authenticate, requirePermission('TABLE_MANAGE'), createTable);
router.patch('/canteen/tables/:id/status', authenticate, requirePermission('TABLE_MANAGE'), updateTableStatus);
router.get('/canteen/orders', authenticate, requirePermission('CANTEEN_ORDER_VIEW'), getCanteenOrders);

// ============================================
// 8. FINANCE
// ============================================
router.get('/finance/overview', authenticate, requirePermission('PAYMENT_VIEW'), getFinancialOverview);
router.get('/finance/payments', authenticate, requirePermission('PAYMENT_VIEW'), getPayments);
router.get('/finance/invoices', authenticate, requirePermission('INVOICE_VIEW'), getInvoices);
router.get('/finance/expenses', authenticate, requirePermission('PAYMENT_MANAGE'), getExpenses);
router.post('/finance/expenses', authenticate, requirePermission('PAYMENT_MANAGE'), createExpense);

// ============================================
// 9. REPORTS
// ============================================
router.get('/reports/all', authenticate, requirePermission('REPORT_VIEW'), getFullReport);

// ============================================
// 10. LEADS
// ============================================
router.get('/leads', authenticate, requirePermission('LEAD_VIEW'), getLeads);
router.post('/leads', authenticate, requirePermission('LEAD_MANAGE'), createLead);
router.patch('/leads/:id/status', authenticate, requirePermission('LEAD_MANAGE'), updateLeadStatus);

// ============================================
// 11. SETTINGS
// ============================================
router.get('/settings', authenticate, requirePermission('MEMBER_VIEW'), getSettings);
router.put('/settings', authenticate, requirePermission('MEMBER_CREATE'), updateSettings);

export default router;
