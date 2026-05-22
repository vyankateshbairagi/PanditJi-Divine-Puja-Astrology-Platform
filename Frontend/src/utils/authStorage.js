// Frontend/src/utils/authStorage.js
// BUG 6 FIX: Unified key naming to camelCase (e.g. adminToken, adminData)
// to match the keys used in apiClient.js's authStorage.
// Previously this file used underscore keys (admin_token, admin_user)
// which caused tokens saved here to be invisible to apiClient.js and vice versa.

const authStorage = {
  // Save auth data (token + user)
  setAuth: (role, data) => {
    if (!role || !data?.token) return;

    // Use camelCase keys to match apiClient.js authStorage
    localStorage.setItem(`${role}Token`, data.token);

    const userData = data.user || data.admin || data.pandit || data.customer;
    if (userData) {
      localStorage.setItem(`${role}Data`, JSON.stringify(userData));
    }

    if (data.refreshToken) {
      localStorage.setItem(`${role}RefreshToken`, data.refreshToken);
    }
  },

  // Get token
  getToken: (role) => {
    return localStorage.getItem(`${role}Token`);
  },

  // Get user data
  getUser: (role) => {
    const user = localStorage.getItem(`${role}Data`);
    return user ? JSON.parse(user) : null;
  },

  // Remove specific role (logout)
  logout: (role) => {
    localStorage.removeItem(`${role}Token`);
    localStorage.removeItem(`${role}Data`);
    localStorage.removeItem(`${role}RefreshToken`);
  },

  // Clear everything (full logout)
  clearAll: () => {
    localStorage.clear();
  }
};

export default authStorage;
