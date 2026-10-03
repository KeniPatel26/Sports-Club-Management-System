import api from './api';

export const courtBookingService = {
  getCourts: async (type = '') => {
    const res = await api.get('/courts', { params: { type } });
    return res.data;
  },

  getCourtSlots: async (courtId, date) => {
    const res = await api.get(`/courts/${courtId}/slots`, { params: { date } });
    return res.data;
  },

  getBookings: async (params = {}) => {
    const res = await api.get('/bookings', { params });
    return res.data;
  },

  createBooking: async (bookingData) => {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  cancelBooking: async (bookingId) => {
    const res = await api.patch(`/bookings/${bookingId}/cancel`);
    return res.data;
  },
};

export default courtBookingService;
