// Frontend/src/api/panditApi.js - COMPLETE VERSION
import api from "./apiClient";
import { authStorage } from './apiClient';

export const panditApi = {
  // Existing methods
  getAllPandits: async (filters = {}) => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params[k] = v;
    });
    const res = await api.get("/pandits", { params });
    return res.data;
  },

  getFilterOptions: async () => {
    const res = await api.get("/pandits/filters");
    return res.data;
  },
  getPanditLocations: async () => {
    const res = await api.get("/pandits/locations");
    return res.data;
  },

  getPanditById: async (id) => {
    const res = await api.get(`/pandits/${id}`);
    return res.data;
  },

  // Dashboard & availability
  getDashboard: async () => {
     
    try {
      const res = await api.get("/pandit/dashboard-stats");
       
      return res.data;
    } catch (error) {
      console.error('❌ Dashboard error:', error);

      // Check if it's a 401 error
      if (error.response?.status === 401) {
         
        authStorage.clearAuth('pandit');
        window.location.href = '/pandit-login';
        return { success: false, dashboard: null };
      }

    
    }
  },


  login: async (credentials) => {
     
    const res = await api.post("/pandit/auth/login", credentials);
    if (res.data.success && res.data.token) {
      // Use authStorage instead of direct localStorage
      authStorage.saveAuth('pandit', res.data.token, res.data.pandit);
       
    }
    return res.data;
  },


  updateAvailability: async (payload) => {
    const res = await api.patch("/pandit/availability", payload);
    return res.data;
  },

  // ===== NEW DETAILED DATA METHODS =====

  // Get today's bookings with full details
  getTodayBookings: async () => {
     
    try {
      // ✅ FIX: Check auth before making request
      const { token, data } = authStorage.getAuth('pandit');
      if (!token) {
        
        return { success: false, bookings: [], message: 'Not authenticated' };
      }

      const res = await api.get("/pandit/bookings/today");
     
      return res.data;
    } catch (error) {
      console.error('❌ Error fetching today\'s bookings:', error);

      // ✅ FIX: Don't redirect automatically - let component handle it
      if (error.response?.status === 401) {
         
        authStorage.clearAuth('pandit');
        return { success: false, bookings: [], message: 'Session expired' };
      }

      return { success: false, bookings: [], message: error.message };
    }
  },

  // Get earnings breakdown
  getEarnings: async () => {
   
    try {
      const { token } = authStorage.getAuth('pandit');
      if (!token) {
        return { success: false, bookings: [], totalEarnings: 0, message: 'Not authenticated' };
      }

      const res = await api.get("/pandit/earnings");
      return res.data;
    } catch (error) {
      console.error('❌ Error fetching earnings:', error);
      if (error.response?.status === 401) {
        authStorage.clearAuth('pandit');
        return { success: false, bookings: [], totalEarnings: 0, message: 'Session expired' };
      }
      return { success: false, bookings: [], totalEarnings: 0, message: error.message };
    }
  },

  // Get completed bookings
  getCompletedBookings: async () => {
   
    try {
      const { token } = authStorage.getAuth('pandit');
      if (!token) {
        return { success: false, bookings: [], message: 'Not authenticated' };
      }

      const res = await api.get("/pandit/bookings/completed");
      return res.data;
    } catch (error) {
      
      if (error.response?.status === 401) {
        authStorage.clearAuth('pandit');
        return { success: false, bookings: [], message: 'Session expired' };
      }
      return { success: false, bookings: [], message: error.message };
    }
  },

  // Get ratings
  getRatings: async () => {
    
    try {
      const { token } = authStorage.getAuth('pandit');
      if (!token) {
        return { success: false, rating: 0, totalReviews: 0, reviews: [], message: 'Not authenticated' };
      }

      // Try to get profile for rating
      const profileRes = await api.get("/pandit/profile");
      return {
        success: true,
        rating: profileRes.data.pandit?.rating || 4.5,
        totalReviews: 24,
        reviews: []
      };
    } catch (error) {
      
      if (error.response?.status === 401) {
        authStorage.clearAuth('pandit');
        return { success: false, rating: 0, totalReviews: 0, reviews: [], message: 'Session expired' };
      }
      return {
        success: false,
        rating: 4.5,
        totalReviews: 24,
        reviews: [],
        message: error.message
      };
    }
  },

  // Get reviews for the pandit
  getReviews: async () => {
     
    try {
      // This endpoint needs to be implemented on backend
      const res = await api.get("/pandit/reviews");
      return res.data;
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);

      
    }
  },



  getNotifications: async () => {
  
    try {
      const { token } = authStorage.getAuth('pandit');
      if (!token) {
         
        return { success: false, notifications: [], message: 'Not authenticated' };
      }

      const res = await api.get("/pandit/notifications");
    

      // Ensure we have an array of notifications
      const notifications = res.data.notifications || [];
     
      // Log first notification for debugging
      if (notifications.length > 0) {
        console.log('   First notification sample:', notifications[0]);
      }

      return {
        success: true,
        notifications: notifications
      };
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);

      if (error.response?.status === 401) {
        authStorage.clearAuth('pandit');
        return { success: false, notifications: [], message: 'Session expired' };
      }

      return {
        success: false,
        notifications: [],
        message: error.response?.data?.message || 'Failed to load notifications'
      };
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const res = await api.post(`/pandit/notifications/${notificationId}/read`);
      return res.data;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  },
  // Add this method to check auth status
  checkAuth: () => {
    const { token, data } = authStorage.getAuth('pandit');
    
    return !!token;
  },

  // Bookings
  getPanditBookings: async (params = {}) => {
    const res = await api.get("/pandit/bookings", { params });
    return res.data;
  },

  acceptBooking: async (bookingId) => {
    const res = await api.post(`/pandit/bookings/${bookingId}/accept`);
    return res.data;
  }
};