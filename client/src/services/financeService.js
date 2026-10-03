import api from './api';

export const financeService = {
  getOverview: async () => {
    const res = await api.get('/finance/overview');
    return res.data;
  },
};

export default financeService;
