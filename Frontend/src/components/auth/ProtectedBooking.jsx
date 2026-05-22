// Frontend/src/components/auth/ProtectedBooking.jsx - FIXED
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProtectedBooking = ({ children, service, onBookClick }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
   
    
    if (!isAuthenticated) {
      // Store booking info for after login
      const bookingData = {
        service: service,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      localStorage.setItem('previousPage', window.location.pathname);
      
      alert('🔐 Please login or register to book this service');
      navigate('/user/login');
    } else {
      // User is authenticated - call the parent's booking function
      console.log('✅ User authenticated, calling onBookClick');
      if (onBookClick) {
        onBookClick(service);
      } else {
        // Fallback: dispatch custom event
        const event = new CustomEvent('openBooking', { detail: service });
        window.dispatchEvent(event);
      }
    }
  };

  // Clone the child element and add onClick handler
  return React.cloneElement(children, {
    onClick: handleClick,
    style: { ...children.props.style, cursor: 'pointer' }
  });
};

export default ProtectedBooking;