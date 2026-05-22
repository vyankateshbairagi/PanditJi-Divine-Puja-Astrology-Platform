// Frontend/src/api/bookingApi.js - CONFIRM THIS IS CORRECT
import api from './apiClient';

export const bookingApi = {
  createBooking: async (payload) => {
    const res = await api.post('/bookings', payload);
    return res.data;
  },

  // Admin endpoints
  getBookings: async (params = {}) => {
    const res = await api.get('/bookings', { params });
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  updateBooking: async (id, payload) => {
    const res = await api.patch(`/bookings/${id}`, payload);
    return res.data;
  },

cancelMyBooking: async (id, data = {}) => {
    const res = await api.put(`/user/bookings/${id}/cancel`, data);
    return res.data;
  },

  // ✅ ADMIN CANCEL - calls admin route (if needed)
  cancelBooking: async (id) => {
    const res = await api.patch(`/bookings/${id}/cancel`);
    return res.data;
  },

  // Pandit endpoints
  getPanditBookings: async (params = {}) => {
    const res = await api.get('/pandit/bookings', { params });
    return res.data;
  },

  acceptBooking: async (bookingId) => {
    const res = await api.post(`/pandit/bookings/${bookingId}/accept`);
    return res.data;
  }
};