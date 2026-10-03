import api from './api';

export const shopCanteenService = {
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  getOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  settleTab: async (orderId) => {
    const res = await api.patch(`/orders/${orderId}/settle-tab`);
    return res.data;
  },
};

export default shopCanteenService;
