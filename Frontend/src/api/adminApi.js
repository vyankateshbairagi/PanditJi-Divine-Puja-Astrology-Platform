// Frontend/src/api/adminApi.js
import api from "./apiClient";
import { authStorage } from './apiClient';
import { API_CONFIG } from "../config";
import { buildUrl } from "../config";

const base = "/admin";


const handleAuthError = (error) => {
  // Only clear token and redirect for actual auth errors on protected routes
  if (error.response?.status === 401) {
    
    
    // Check if this is the bookings endpoint - maybe don't logout for this
    const isBookingsEndpoint = error.config?.url?.includes('/bookings');
    
    if (isBookingsEndpoint) {
      
      // Return a special error instead of logging out
      throw new Error('Bookings data temporarily unavailable');
    }
    
    
    authStorage.clearAuth('admin');
    
    // Redirect to login if on admin page
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin-login';
    }
  }
  throw error;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      
      authStorage.clearAuth('admin');
      
      // Only redirect if we're on an admin page
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin-login';
      }
      
      throw new Error('Session expired. Please login again.');
    }
    
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  
  return response.json();
};

export const adminApi = {
  login: async (credentials) => {

    const res = await api.post(`${base}/login`, credentials);
    return res.data;

},

  getDashboardStats: async () => {
    const res = await api.get(`${base}/dashboard`);
    return res.data;
  },

  getAllData: async () => {
    const res = await api.get(`${base}/all-data`);
    return res.data;
  },

  createPandit: async (panditData) => {
  
  
  const { token } = authStorage.getAuth('admin');
  if (!token) {
    throw new Error('No admin token found');
  }
  
  const formData = new FormData();
  
  // Make sure password is included (default to 'pandit123' if not provided)
  const dataToSend = {
    ...panditData,
    password: panditData.password || 'pandit123' // Add default password
  };
  
  Object.keys(dataToSend).forEach((k) => {
    if (k === "services" || k === "languages") {
      // Ensure arrays are properly stringified
      formData.append(k, JSON.stringify(dataToSend[k] || []));
    } else if (k === "image" && dataToSend[k] instanceof File) {
      formData.append("panditImage", dataToSend[k]);
    } else if (k !== "_id" && k !== "__v" && dataToSend[k] !== undefined && dataToSend[k] !== null) {
      // Convert numbers to strings for FormData
      formData.append(k, String(dataToSend[k]));
    }
  });
  
  // Log FormData for debugging

  for (let pair of formData.entries()) {
    console.log(`   ${pair[0]}: ${pair[1]}`);
  }
  
  try {
    const res = await fetch(buildUrl(`${base}/pandits`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData
    });
    
    const responseData = await res.json();
    
    if (!res.ok) {
      
      throw new Error(responseData.message || responseData.error || 'Failed to create pandit');
    }
    
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Error in createPandit:', error);
    throw error;
  }
},

  updatePandit: async (id, panditData) => {
    
    
    const { token } = authStorage.getAuth('admin');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const formData = new FormData();
    Object.keys(panditData).forEach((k) => {
      if (k === "services" || k === "languages") {
        formData.append(k, JSON.stringify(panditData[k]));
      } else if (k === "image" && panditData[k] instanceof File) {
        formData.append("panditImage", panditData[k]);
      } else if (k !== "_id" && k !== "__v") {
        formData.append(k, panditData[k]);
      }
    });
    
    const res = await fetch(buildUrl(`${base}/pandits/${id}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update pandit');
    }
    
    return await res.json();
  },

  deletePandit: async (id) => {
    
    
    const { token } = authStorage.getAuth('admin');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const res = await fetch(buildUrl(`${base}/pandits/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete pandit');
    }
    
    return await res.json();
  },

  togglePanditAvailability: async (id) => {
    const { token } = authStorage.getAuth('admin');
    if (!token) {
      throw new Error('No admin token found');
    }
    
    const res = await fetch(buildUrl(`${base}/pandits/${id}/toggle-availability`), {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to toggle availability');
    }
    
    return await res.json();
  },


  // services
  // frontend/src/api/adminApi.js
createService: async (serviceData) => {
  // Don't set Content-Type header - let browser set it with boundary for FormData
  const { token } = authStorage.getAuth('admin');
  
  if (!token) {
    throw new Error('No admin token found');
  }
  
  // If serviceData is already FormData, use it directly
  const formData = serviceData instanceof FormData ? serviceData : (() => {
    const fd = new FormData();
    Object.keys(serviceData).forEach(key => {
      if (key === 'details' && Array.isArray(serviceData[key])) {
        fd.append(key, JSON.stringify(serviceData[key]));
      } else if (key === 'image' && serviceData[key] instanceof File) {
        fd.append('serviceImage', serviceData[key]);
      } else if (key !== '_id' && key !== '__v' && serviceData[key] !== undefined && serviceData[key] !== null) {
        fd.append(key, String(serviceData[key]));
      }
    });
    return fd;
  })();
  
  const response = await fetch(buildUrl('/admin/services'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // ❌ DON'T set Content-Type here
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create service');
  }
  
  return response.json();
},

updateService: async (id, serviceData) => {
  const { token } = authStorage.getAuth('admin');
  
  const formData = serviceData instanceof FormData ? serviceData : (() => {
    const fd = new FormData();
    Object.keys(serviceData).forEach(key => {
      if (key === 'details' && Array.isArray(serviceData[key])) {
        fd.append(key, JSON.stringify(serviceData[key]));
      } else if (key === 'image' && serviceData[key] instanceof File) {
        fd.append('serviceImage', serviceData[key]);
      } else if (key !== '_id' && key !== '__v' && serviceData[key] !== undefined && serviceData[key] !== null) {
        fd.append(key, String(serviceData[key]));
      }
    });
    return fd;
  })();
  
  const response = await fetch(buildUrl(`/admin/services/${id}`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update service');
  }
  
  return response.json();
},

  deleteService: async (id) => {
    const res = await api.delete(`${base}/services/${id}`);
    return res.data;
  },

  toggleServiceActivity: async (id) => {
    const res = await api.patch(`${base}/services/${id}/toggle-activity`);
    return res.data;
  },

  bulkUpdatePandits: async (ids, updateData) => {
    const res = await api.post(`${base}/pandits/bulk-update`, { ids, updateData });
    return res.data;
  },

  bulkUpdateServices: async (ids, updateData) => {
    const res = await api.post(`${base}/services/bulk-update`, { ids, updateData });
    return res.data;
  },
 getAllBookings: async (filters = {}) => {
  
  
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const { token } = authStorage.getAuth('admin');
    
    
    if (!token) {
      
      throw new Error('No admin token found');
    }
    
    // Try MULTIPLE URL formats to see which works
    const urls = [
  buildUrl(`/admin/bookings?${params.toString()}`),
  buildUrl(`/bookings?${params.toString()}`)
];
    
    console.log('📡 Testing URLs:');
    
    // Try each URL until one works
    for (const url of urls) {
      
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          
          const data = await response.json();
          return data;
        } else {
          console.log(`❌ Failed with status: ${response.status}`);
        }
      } catch (e) {
        console.log(`❌ Error with ${url}:`, e.message);
      }
    }
    
    throw new Error('All URLs failed');
    
  } catch (error) {
    console.error('❌ getAllBookings error:', error);
    // Return empty data to prevent logout
    return { 
      success: false, 
      bookings: [], 
      stats: {},
      message: error.message 
    };
  }
},

  

  // Get pandit performance stats
  getPanditPerformance: async () => {
    try {
      
      const res = await api.get('/admin/pandits/performance');
      return res.data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },
   

  // Get booking analytics
  getBookingAnalytics: async (period = 'month') => {
    try{
    const res = await api.get(`/admin/analytics/bookings?period=${period}`);
    return res.data;
    }catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Get recent activity
  getRecentActivity: async (limit = 20) => {
    try {
      const res = await api.get(`/admin/activity/recent?limit=${limit}`);
      return res.data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  // Get single booking details
  getBookingDetails: async (bookingId) => {
    try{
      const res = await api.get(`/admin/bookings/${bookingId}`);
    return res.data;
    } catch(error){
      handleAuthError(error);
      throw error;
    }
    
    
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try{
    const res = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
    return res.data;
    }catch (error) {
      handleAuthError(error);
      throw error;
    }
  }
};
