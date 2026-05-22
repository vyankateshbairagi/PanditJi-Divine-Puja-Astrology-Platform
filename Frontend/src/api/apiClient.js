import axios from "axios";
import { API_CONFIG } from "../config";

const API_BASE = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth Storage ─────────────────────────────────────────────────────────────

export const authStorage = {
  saveAuth: (role, token, data) => {
    if (!role || !token) return;
    // Use consistent camelCase keys
    localStorage.setItem(`${role}Token`, token);
    localStorage.setItem(`${role}Data`, JSON.stringify(data));
  },

  getAuth: (role) => {
    const token = localStorage.getItem(`${role}Token`);
    const dataStr = localStorage.getItem(`${role}Data`);
    let data = null;
    if (dataStr) {
      try { data = JSON.parse(dataStr); } catch { /* ignore */ }
    }
    return { token, data };
  },

  clearAuth: (role) => {
    localStorage.removeItem(`${role}Token`);
    localStorage.removeItem(`${role}Data`);
    window.dispatchEvent(new StorageEvent('storage', {
      key: `${role}Token`,
      oldValue: 'was_set',
      newValue: null,
      storageArea: localStorage,
    }));
  },

  clearAllAuth: () => {
    ['admin', 'pandit', 'user'].forEach(role => authStorage.clearAuth(role));
  },

  isAuthenticated: (role) => {
    const { token } = authStorage.getAuth(role);
    if (!token) return false;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < exp * 1000;
    } catch {
      return false;
    }
  },
};

// ─── Token verification before every request ──────────────────────────────────

const verifyTokenBeforeRequest = (config) => {
  const isPublicRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/send-otp') ||
    config.url?.includes('/auth/register') ||
    config.url?.includes('/admin/login') ||
    config.url?.includes('/pandit/auth/login') ||
    config.url?.includes('/user/login') ||
    config.url?.includes('/user/register') ||
    config.url === '/pandits' ||
    config.url === '/services' ||
    (config.url === '/bookings' && config.method === 'post');

  if (isPublicRoute) return { valid: true, isPublic: true };

  let authType = null;
  let token = null;

  if (config.url?.startsWith('/admin/')) {
    authType = 'admin';
    token = authStorage.getAuth('admin').token;
  } else if (config.url?.startsWith('/pandit/')) {
    authType = 'pandit';
    token = authStorage.getAuth('pandit').token;
  } else if (config.url?.startsWith('/user/')) {
    authType = 'user';
    token = authStorage.getAuth('user').token;
  } else if (config.url === '/free-astro/kundali' && config.method === 'post') {
    authType = 'user';
    token = authStorage.getAuth('user').token;
  } else if (config.url?.startsWith('/bookings') && config.method !== 'post') {
    authType = 'user';
    token = authStorage.getAuth('user').token;
  }

  if (!authType) return { valid: true };

  const redirectMap = {
    admin: '/admin-login',
    pandit: '/pandit-login',
    user: '/user/login',
  };

  if (!token) {
    return { valid: false, authType, reason: 'no_token', redirect: redirectMap[authType] };
  }

  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    if (Date.now() >= exp * 1000) {
      // Token expired — clear storage (this will also fire the storage event
      // that AuthContext listens to, so React state clears as well)
      authStorage.clearAuth(authType);
      return { valid: false, authType, reason: 'expired', redirect: redirectMap[authType] };
    }
  } catch {
    return { valid: false, authType, reason: 'invalid', redirect: redirectMap[authType] };
  }

  return { valid: true, authType, token };
};

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use((config) => {
  const verification = verifyTokenBeforeRequest(config);

  if (!verification.valid) {
    // Only redirect if we're currently on a protected page for that role
    if (verification.authType) {
      const isOnProtectedPage =
        window.location.pathname.startsWith(`/${verification.authType}`) ||
        window.location.pathname.startsWith('/user/dashboard');

      if (isOnProtectedPage) {
        window.location.href = verification.redirect;
      }
    }
    return Promise.reject(new Error(`Token ${verification.reason}`));
  }

  if (verification.token) {
    config.headers.Authorization = `Bearer ${verification.token}`;
  }

  return config;
});



api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only logout for actual 401 authentication errors
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      let authType = null;

      if (url.startsWith('/admin/')) authType = 'admin';
      else if (url.startsWith('/pandit/')) authType = 'pandit';
      else if (url.startsWith('/user/') || url.startsWith('/bookings') || url === '/free-astro/kundali') authType = 'user';

      if (authType) {
        // Check if it's a real token expiry or just a temporary issue
        const { token } = authStorage.getAuth(authType);
        
        if (token) {
          try {
            // Check if token is actually expired
            const { exp } = JSON.parse(atob(token.split('.')[1]));
            const isExpired = Date.now() >= exp * 1000;
            
            if (isExpired) {
              // Only logout if token is truly expired
              console.log(`🕐 Token expired for ${authType}, logging out...`);
              authStorage.clearAuth(authType);
              
              const redirectMap = { admin: '/admin-login', pandit: '/pandit-login', user: '/user/login' };
              const isOnProtectedPage =
                window.location.pathname.startsWith(`/${authType}`) ||
                window.location.pathname.startsWith('/user/dashboard');
              
              if (isOnProtectedPage) {
                window.location.href = redirectMap[authType];
              }
            } else {
              // Token is still valid, don't logout
              console.log(`⚠️ 401 error but token still valid for ${authType}, not logging out`);
            }
          } catch (parseError) {
            console.error('Error parsing token:', parseError);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
