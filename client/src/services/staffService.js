import api from './api';

export const staffService = {
  getStaff: async (params = {}) => {
    const res = await api.get('/staff', { params });
    return res.data;
  },

  createStaff: async (staffData) => {
    const res = await api.post('/staff', staffData);
    return res.data;
  },

  getShifts: async (params = {}) => {
    const res = await api.get('/staff/shifts', { params });
    return res.data;
  },

  createShift: async (shiftData) => {
    const res = await api.post('/staff/shifts', shiftData);
    return res.data;
  },

  getLeaves: async () => {
    const res = await api.get('/staff/leaves');
    return res.data;
  },

  requestLeave: async (leaveData) => {
    const res = await api.post('/staff/leaves', leaveData);
    return res.data;
  },

  updateLeaveStatus: async (id, status) => {
    const res = await api.patch(`/staff/leaves/${id}/status`, { status });
    return res.data;
  },
};

export default staffService;
