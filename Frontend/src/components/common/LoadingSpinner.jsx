// Frontend/src/components/common/LoadingSpinner.jsx

import React from 'react';
import '../../styles/LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary',
  text = 'Loading...',
  overlay = false 
}) => {
  return (
    <div className={`loading-spinner-container ${overlay ? 'overlay' : ''}`}>
      <div className={`spinner ${size} ${color}`}>
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

// Inline spinner for small loading states
export const InlineSpinner = ({ size = 'small' }) => (
  <div className={`inline-spinner ${size}`}>
    <div className="spinner-dot"></div>
    <div className="spinner-dot"></div>
    <div className="spinner-dot"></div>
  </div>
);
export default LoadingSpinner;