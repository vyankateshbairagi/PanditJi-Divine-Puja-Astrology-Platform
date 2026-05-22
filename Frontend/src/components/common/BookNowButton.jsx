// Frontend/src/components/common/BookNowButton.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const BookNowButton = ({ service, onBookClick }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    console.log('🎯 BookNowButton clicked for:', service.name);
    
    if (!isAuthenticated) {
      // Store pending booking
      localStorage.setItem('pendingBooking', JSON.stringify({
        service: service,
        redirectTo: window.location.pathname
      }));
      
      // Redirect to login
      navigate('/user/login');
      return;
    }
    
    // User is logged in, open booking modal
    if (onBookClick) {
      onBookClick(service);
    }
  };

  return (
    <button
      className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-maroon1 to-brand-maroon2 px-4 py-3 text-sm font-semibold text-white shadow-heavy-maroon transition hover:-translate-y-0.5 disabled:opacity-60"
      onClick={handleClick}
    >
      {t('bookAPuja')}
    </button>
  );
};

export default BookNowButton;