// Frontend/src/config.js
const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  if (apiUrl) {
    return apiUrl.replace(/\/$/, '');
  }

  return import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://panditji-backend.onrender.com/api';
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
