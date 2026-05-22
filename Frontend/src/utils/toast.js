// Frontend/src/utils/toast.js
export const toast = {
  success: (message) => {
    // You can integrate with toast libraries like react-toastify
    //console.log('✅', message);
    alert(message); // Temporary - replace with proper toast
  },
  
  error: (message) => {
    console.error('❌', message);
    alert('Error: ' + message); // Temporary - replace with proper toast
  },
  
  info: (message) => {
    //console.log('ℹ️', message);
    // Add proper toast implementation
  }
};

// Usage:
// toast.success('Booking created successfully!');
// toast.error('Failed to create booking');