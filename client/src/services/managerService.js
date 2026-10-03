import api from './api';

export const managerService = {
  // 1. Dashboard
  getDashboardOverview: async () => {
    const res = await api.get('/manager/dashboard');
    return res.data;
  },

  // 2. Members
  getMembers: async (params = {}) => {
    const res = await api.get('/manager/members', { params });
    return res.data;
  },

  getMemberById: async (id) => {
    const res = await api.get(`/manager/members/${id}`);
    return res.data;
  },

  createMember: async (data) => {
    const res = await api.post('/manager/members', data);
    return res.data;
  },

  updateMember: async (id, data) => {
    const res = await api.put(`/manager/members/${id}`, data);
    return res.data;
  },

  toggleMemberStatus: async (id) => {
    const res = await api.patch(`/manager/members/${id}/toggle-status`);
    return res.data;
  },

  // 3. Membership & Plans
  getPlans: async () => {
    const res = await api.get('/manager/memberships/plans');
    return res.data;
  },

  createPlan: async (data) => {
    const res = await api.post('/manager/memberships/plans', data);
    return res.data;
  },

  updatePlan: async (id, data) => {
    const res = await api.put(`/manager/memberships/plans/${id}`, data);
    return res.data;
  },

  getMembershipsList: async (params = {}) => {
    const res = await api.get('/manager/memberships/list', { params });
    return res.data;
  },

  assignOrRenewMembership: async (data) => {
    const res = await api.post('/manager/memberships/assign', data);
    return res.data;
  },

  // 4. Employees & ERP
  getEmployees: async (params = {}) => {
    const res = await api.get('/manager/employees', { params });
    return res.data;
  },

  createEmployee: async (data) => {
    const res = await api.post('/manager/employees', data);
    return res.data;
  },

  updateEmployee: async (id, data) => {
    const res = await api.put(`/manager/employees/${id}`, data);
    return res.data;
  },

  getShifts: async () => {
    const res = await api.get('/manager/employees/shifts/all');
    return res.data;
  },

  createShift: async (data) => {
    const res = await api.post('/manager/employees/shifts', data);
    return res.data;
  },

  getTodayAttendance: async () => {
    const res = await api.get('/manager/employees/attendance/today');
    return res.data;
  },

  recordAttendance: async (data) => {
    const res = await api.post('/manager/employees/attendance/record', data);
    return res.data;
  },

  getLeaveRequests: async () => {
    const res = await api.get('/manager/employees/leave/all');
    return res.data;
  },

  updateLeaveStatus: async (id, status) => {
    const res = await api.patch(`/manager/employees/leave/${id}`, { status });
    return res.data;
  },

  getPayroll: async () => {
    const res = await api.get('/manager/employees/payroll/all');
    return res.data;
  },

  markPayrollPaid: async (data) => {
    const res = await api.post('/manager/employees/payroll/pay', data);
    return res.data;
  },

  // 5. Courts & Bookings
  getCourts: async () => {
    const res = await api.get('/manager/courts');
    return res.data;
  },

  createCourt: async (data) => {
    const res = await api.post('/manager/courts', data);
    return res.data;
  },

  updateCourt: async (id, data) => {
    const res = await api.put(`/manager/courts/${id}`, data);
    return res.data;
  },

  toggleCourtMaintenance: async (id) => {
    const res = await api.patch(`/manager/courts/${id}/maintenance`);
    return res.data;
  },

  getBookings: async (params = {}) => {
    const res = await api.get('/manager/courts/bookings/all', { params });
    return res.data;
  },

  cancelBooking: async (id) => {
    const res = await api.patch(`/manager/courts/bookings/${id}/cancel`);
    return res.data;
  },

  // 6. Sports Shop & Inventory
  getProducts: async (params = {}) => {
    const res = await api.get('/manager/shop/products', { params });
    return res.data;
  },

  createProduct: async (data) => {
    const res = await api.post('/manager/shop/products', data);
    return res.data;
  },

  updateProduct: async (id, data) => {
    const res = await api.put(`/manager/shop/products/${id}`, data);
    return res.data;
  },

  adjustStock: async (data) => {
    const res = await api.post('/manager/shop/inventory/adjust', data);
    return res.data;
  },

  getInventoryLogs: async () => {
    const res = await api.get('/manager/shop/inventory/logs');
    return res.data;
  },

  getShopOrders: async (params = {}) => {
    const res = await api.get('/manager/shop/orders', { params });
    return res.data;
  },

  // 7. Canteen & Tables
  getMenu: async (params = {}) => {
    const res = await api.get('/manager/canteen/menu', { params });
    return res.data;
  },

  createMenuItem: async (data) => {
    const res = await api.post('/manager/canteen/menu', data);
    return res.data;
  },

  updateMenuItem: async (id, data) => {
    const res = await api.put(`/manager/canteen/menu/${id}`, data);
    return res.data;
  },

  getTables: async () => {
    const res = await api.get('/manager/canteen/tables');
    return res.data;
  },

  createTable: async (data) => {
    const res = await api.post('/manager/canteen/tables', data);
    return res.data;
  },

  updateTableStatus: async (id, data) => {
    const res = await api.patch(`/manager/canteen/tables/${id}/status`, data);
    return res.data;
  },

  getCanteenOrders: async (params = {}) => {
    const res = await api.get('/manager/canteen/orders', { params });
    return res.data;
  },

  // 8. Finance
  getFinancialOverview: async () => {
    const res = await api.get('/manager/finance/overview');
    return res.data;
  },

  getPayments: async (params = {}) => {
    const res = await api.get('/manager/finance/payments', { params });
    return res.data;
  },

  getInvoices: async (params = {}) => {
    const res = await api.get('/manager/finance/invoices', { params });
    return res.data;
  },

  getExpenses: async () => {
    const res = await api.get('/manager/finance/expenses');
    return res.data;
  },

  createExpense: async (data) => {
    const res = await api.post('/manager/finance/expenses', data);
    return res.data;
  },

  // 9. Reports
  getFullReport: async () => {
    const res = await api.get('/manager/reports/all');
    return res.data;
  },

  // 10. Leads CRM
  getLeads: async (params = {}) => {
    const res = await api.get('/manager/leads', { params });
    return res.data;
  },

  createLead: async (data) => {
    const res = await api.post('/manager/leads', data);
    return res.data;
  },

  updateLeadStatus: async (id, data) => {
    const res = await api.patch(`/manager/leads/${id}/status`, data);
    return res.data;
  },

  // 11. Settings
  getSettings: async () => {
    const res = await api.get('/manager/settings');
    return res.data;
  },

  updateSettings: async (data) => {
    const res = await api.put('/manager/settings', data);
    return res.data;
  },
};

export default managerService;
