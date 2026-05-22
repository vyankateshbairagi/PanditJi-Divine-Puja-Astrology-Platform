// frontend/src/main.jsx - UPDATED VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

//console.log('🚀 React version:', React.version); // Debug React

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  //console.log('✅ DOM is ready');
  
  const rootElement = document.getElementById('root');
  //console.log('✅ Root element found:', !!rootElement);
  
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(React.StrictMode, {}, React.createElement(App)));
    //console.log('✅ React app rendered');
  } else {
    console.error('❌ Root element not found');
  }
});