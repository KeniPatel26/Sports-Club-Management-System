import api from './api';

export const activityService = {
  getActivities: async (limit = 15) => {
    const res = await api.get('/activities', { params: { limit } });
    return res.data;
  },

  getAuditLogs: async (limit = 20) => {
    const res = await api.get('/activities/audit-logs', { params: { limit } });
    return res.data;
  },
};

export default activityService;
