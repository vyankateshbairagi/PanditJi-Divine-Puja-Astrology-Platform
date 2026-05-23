// Frontend/src/config.js
const DEFAULT_DEV_API_URL = 'http://localhost:5000/api';
const DEFAULT_PROD_API_URL = 'https://panditji-backend.onrender.com/api';

const isLocalhostApiUrl = (url) => /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?\/api$/i.test(url);

const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (import.meta.env.PROD) {
    if (apiUrl && !isLocalhostApiUrl(apiUrl)) {
      return apiUrl.replace(/\/$/, '');
    }

    return DEFAULT_PROD_API_URL;
  }

  if (apiUrl) {
    return apiUrl.replace(/\/$/, '');
  }

  return DEFAULT_DEV_API_URL;
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
