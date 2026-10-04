import api from './api';

export const staffService = {
  // ============================================
  // COMMON STAFF (ALL DEPARTMENTS)
  // ============================================
  getMyProfile: async () => {
    const res = await api.get('/staff/profile');
    return res.data;
  },

  getMyAttendance: async () => {
    const res = await api.get('/attendance/my');
    return res.data;
  },

  checkIn: async () => {
    const res = await api.post('/attendance/check-in');
    return res.data;
  },

  checkOut: async () => {
    const res = await api.post('/attendance/check-out');
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/staff/notifications');
    return res.data;
  },

  // ============================================
  // 1. FRONT DESK STAFF
  // ============================================
  getFrontDeskOverview: async () => {
    const res = await api.get('/staff/front-desk/overview');
    return res.data;
  },

  getCourtAvailability: async (date) => {
    const res = await api.get('/staff/front-desk/courts/availability', {
      params: { date },
    });
    return res.data;
  },

  searchMembers: async (query) => {
    const res = await api.get('/staff/front-desk/members/search', {
      params: { query },
    });
    return res.data;
  },

  getMemberHistory: async (memberId) => {
    const res = await api.get(`/staff/front-desk/members/${memberId}/history`);
    return res.data;
  },

  createFrontDeskBooking: async (bookingData) => {
    const res = await api.post('/staff/front-desk/bookings', bookingData);
    return res.data;
  },

  checkInBooking: async (bookingId) => {
    const res = await api.post(`/staff/front-desk/bookings/${bookingId}/check-in`);
    return res.data;
  },

  checkOutBooking: async (bookingId) => {
    const res = await api.post(`/staff/front-desk/bookings/${bookingId}/check-out`);
    return res.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const res = await api.patch(`/staff/front-desk/bookings/${bookingId}/status`, {
      status,
    });
    return res.data;
  },

  rescheduleBooking: async (bookingId, data) => {
    const res = await api.patch(`/staff/front-desk/bookings/${bookingId}/reschedule`, data);
    return res.data;
  },

  cancelBooking: async (bookingId, data) => {
    const res = await api.post(`/staff/front-desk/bookings/${bookingId}/cancel`, data);
    return res.data;
  },

  collectBookingPayment: async (bookingId, data) => {
    const res = await api.post(`/staff/front-desk/bookings/${bookingId}/collect-payment`, data);
    return res.data;
  },

  getFrontDeskPayments: async (params = {}) => {
    const res = await api.get('/staff/front-desk/payments', { params });
    return res.data;
  },

  getMembershipPlans: async () => {
    const res = await api.get('/staff/front-desk/memberships/plans');
    return res.data;
  },

  getMembershipsList: async (params = {}) => {
    const res = await api.get('/staff/front-desk/memberships/list', { params });
    return res.data;
  },

  assignOrRenewMembership: async (data) => {
    const res = await api.post('/staff/front-desk/memberships/assign', data);
    return res.data;
  },

  getDailyClosingSummary: async () => {
    const res = await api.get('/staff/front-desk/daily-closing');
    return res.data;
  },

  submitDailyClosingReport: async () => {
    const res = await api.post('/staff/front-desk/daily-closing');
    return res.data;
  },

  // ============================================
  // 2. SPORTS SHOP STAFF
  // ============================================
  getShopOverview: async () => {
    const res = await api.get('/staff/sports-shop/overview');
    return res.data;
  },

  getShopProducts: async (params = {}) => {
    const res = await api.get('/staff/sports-shop/products', { params });
    return res.data;
  },

  createShopProduct: async (productData) => {
    const res = await api.post('/staff/sports-shop/products', productData);
    return res.data;
  },

  updateShopProduct: async (productId, productData) => {
    const res = await api.patch(`/staff/sports-shop/products/${productId}`, productData);
    return res.data;
  },

  receiveStock: async (stockData) => {
    const res = await api.post('/staff/sports-shop/inventory/receive', stockData);
    return res.data;
  },

  adjustStock: async (data) => {
    const res = await api.post('/staff/sports-shop/inventory/adjust', data);
    return res.data;
  },

  reportDamagedStock: async (data) => {
    const res = await api.post('/staff/sports-shop/inventory/damage', data);
    return res.data;
  },

  getInventoryHistory: async () => {
    const res = await api.get('/staff/sports-shop/inventory/history');
    return res.data;
  },

  processCounterSale: async (posData) => {
    const res = await api.post('/staff/sports-shop/pos/checkout', posData);
    return res.data;
  },

  getShopOrders: async (params = {}) => {
    const res = await api.get('/staff/sports-shop/orders', { params });
    return res.data;
  },

  updateShopOrderStatus: async (orderId, status) => {
    const res = await api.patch(`/staff/sports-shop/orders/${orderId}/status`, {
      status,
    });
    return res.data;
  },

  processOrderReturn: async (orderId, data) => {
    const res = await api.post(`/staff/sports-shop/orders/${orderId}/return`, data);
    return res.data;
  },

  getShopPayments: async () => {
    const res = await api.get('/staff/sports-shop/payments');
    return res.data;
  },

  reportLowStock: async (data) => {
    const res = await api.post('/staff/sports-shop/report-low-stock', data);
    return res.data;
  },


  // ============================================
  // 3. CANTEEN & BAR STAFF
  // ============================================
  getCanteenOverview: async () => {
    const res = await api.get('/staff/canteen/overview');
    return res.data;
  },

  getDiningTables: async () => {
    const res = await api.get('/staff/canteen/tables');
    return res.data;
  },

  updateTableStatus: async (tableId, data) => {
    const res = await api.patch(`/staff/canteen/tables/${tableId}/status`, data);
    return res.data;
  },

  getCanteenMenu: async () => {
    const res = await api.get('/staff/canteen/menu');
    return res.data;
  },

  toggleItemAvailability: async (itemId) => {
    const res = await api.patch(`/staff/canteen/menu/${itemId}/toggle-availability`);
    return res.data;
  },

  createCanteenOrder: async (orderData) => {
    const res = await api.post('/staff/canteen/orders', orderData);
    return res.data;
  },

  getCanteenOrders: async (params = {}) => {
    const res = await api.get('/staff/canteen/orders', { params });
    return res.data;
  },

  updateCanteenOrderStatus: async (orderId, status) => {
    const res = await api.patch(`/staff/canteen/orders/${orderId}/status`, {
      status,
    });
    return res.data;
  },

  getOpenTabs: async () => {
    const res = await api.get('/staff/canteen/tabs/open');
    return res.data;
  },

  settleCanteenTab: async (settleData) => {
    const res = await api.post('/staff/canteen/tabs/settle', settleData);
    return res.data;
  },

  getCanteenPayments: async () => {
    const res = await api.get('/staff/canteen/payments');
    return res.data;
  },
};

export default staffService;
