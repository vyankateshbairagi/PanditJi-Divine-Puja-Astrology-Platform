// Create a utility: Frontend/src/utils/errorHandler.js
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || error.response.data?.userMessage || fallbackMessage;
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something else
    return error.message || fallbackMessage;
  }
};

// Usage in components:
try {
  const result = await apiCall();
} catch (error) {
  setError(handleApiError(error, 'Failed to load data'));
}