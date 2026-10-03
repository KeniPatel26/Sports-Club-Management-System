import api from './api';

export const leadService = {
  createLead: async (leadData) => {
    const res = await api.post('/leads', leadData);
    return res.data;
  },

  getLeads: async (params = {}) => {
    const res = await api.get('/leads', { params });
    return res.data;
  },
};

export default leadService;
