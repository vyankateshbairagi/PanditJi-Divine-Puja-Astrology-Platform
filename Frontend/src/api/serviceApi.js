// Frontend/src/api/serviceApi.js
import api from "./apiClient";

export const serviceApi = {
  getAllServices: async () => {
    
    const res = await api.get("/services");
    
    return res.data;
  },

  getActiveServices: async (category = "") => {
     
    const params = {};
    if (category) params.category = category;
 
    const res = await api.get("/services/active", { params });
     
    return res.data;
  },

  getServiceById: async (id) => {
    
    const res = await api.get(`/services/${id}`);
 
    return res.data;
  }
};
