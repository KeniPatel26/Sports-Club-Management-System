import api from './api';

export const membershipService = {
  getPlans: async () => {
    const res = await api.get('/memberships/plans');
    return res.data;
  },

  createPlan: async (planData) => {
    const res = await api.post('/memberships/plans', planData);
    return res.data;
  },

  subscribeMembership: async (subscriptionData) => {
    const res = await api.post('/memberships/subscribe', subscriptionData);
    return res.data;
  },

  getMemberMembership: async (userId) => {
    const res = await api.get(`/memberships/member/${userId}`);
    return res.data;
  },

  getMyMembership: async () => {
    const res = await api.get('/memberships/my-membership');
    return res.data;
  },
};

export default membershipService;
