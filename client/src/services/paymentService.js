import api from './api';

export const paymentService = {
  /**
   * Create a new payment record (amount computed securely by backend)
   */
  createPayment: async ({ purpose, referenceId, paymentMethod = 'UPI', customerName, notes }) => {
    const res = await api.post('/payments', {
      purpose,
      referenceId,
      paymentMethod,
      customerName,
      notes,
    });
    return res.data;
  },

  /**
   * Confirm or simulate demo payment success / failure
   */
  confirmPayment: async (paymentId, { simulateSuccess = true, status, paymentMethod } = {}) => {
    const res = await api.post(`/payments/${paymentId}/confirm`, {
      simulateSuccess,
      status,
      paymentMethod,
    });
    return res.data;
  },

  /**
   * Get single payment details
   */
  getPayment: async (paymentId) => {
    const res = await api.get(`/payments/${paymentId}`);
    return res.data;
  },

  /**
   * Get current member's payment transactions
   */
  getMyPayments: async () => {
    const res = await api.get('/payments/my');
    return res.data;
  },

  /**
   * Get consolidated revenue and payment summary
   */
  getPaymentSummary: async () => {
    const res = await api.get('/payments/summary');
    return res.data;
  },

  /**
   * Get manager payments log
   */
  getManagerPayments: async (params = {}) => {
    const res = await api.get('/payments/manager/all', { params });
    return res.data;
  },
};

export default paymentService;
