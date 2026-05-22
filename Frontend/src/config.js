// Frontend/src/config.js
const getApiUrl = () => {
  // Production: use environment variable from Netlify
  if (import.meta.env.PROD) {
    // Make sure your Netlify env var is set to: https://panditji-backend.onrender.com/api
    // WITHOUT trailing slash
    return import.meta.env.VITE_API_BASE_URL || 'https://panditji-backend.onrender.com/api';
  }
  
  // Development
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000,
};

export const buildUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${baseUrl}/${cleanEndpoint}`;
};

export default API_CONFIG;
