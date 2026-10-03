import api from '../api';

export const memberCourtService = {
  // Get Member Courts
  getMemberCourts: async (type = '') => {
    const res = await api.get('/member/courts', { params: { type } });
    return res.data;
  },

  // Get Court Slots for Date
  getMemberCourtSlots: async (courtId, date) => {
    const res = await api.get(`/member/courts/${courtId}/slots`, { params: { date } });
    return res.data;
  },

  // Get Member Stats
  getMemberStats: async () => {
    const res = await api.get('/member/stats');
    return res.data;
  },

  // Get Member Bookings
  getMemberBookings: async (params = {}) => {
    const res = await api.get('/member/bookings', { params });
    return res.data;
  },

  // Create Booking
  createMemberBooking: async (bookingData) => {
    const res = await api.post('/member/bookings', bookingData);
    return res.data;
  },

  // Cancel Booking
  cancelMemberBooking: async (bookingId) => {
    const res = await api.patch(`/member/bookings/${bookingId}/cancel`);
    return res.data;
  },
};

export default memberCourtService;
