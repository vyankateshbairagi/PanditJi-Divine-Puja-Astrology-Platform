// Frontend/src/utils/analytics.js

// Simple analytics utility for tracking user events
export const analytics = {
  // Track page views
  trackPageView: (pageName) => {
    if (process.env.NODE_ENV === 'production') {
      //console.log('📊 Page View:', pageName);
      // Integrate with Google Analytics, Mixpanel, etc.
      // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_title: pageName });
    }
  },

  // Track user actions
  trackEvent: (eventName, properties = {}) => {
    if (process.env.NODE_ENV === 'production') {
      //console.log('🎯 Event:', eventName, properties);
      // Example: gtag('event', eventName, properties);
    }
  },

  // Track booking events
  trackBooking: (bookingData) => {
    analytics.trackEvent('booking_created', {
      service: bookingData.serviceId,
      price: bookingData.price,
      pandit: bookingData.panditId
    });
  },

  // Track search events
  trackSearch: (searchTerm, filters = {}) => {
    analytics.trackEvent('search_performed', {
      search_term: searchTerm,
      filters: filters
    });
  },

  // Track authentication events
  trackAuth: (action, userType) => {
    analytics.trackEvent(`${action}_${userType}`, {
      timestamp: new Date().toISOString()
    });
  },

  // Track errors
  trackError: (error, context = {}) => {
    console.error('🚨 Error tracked:', error, context);
    analytics.trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context: context
    });
  }
};

// Common event types for consistent tracking
export const EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  BOOKING: 'booking',
  LOGIN: 'login',
  LOGOUT: 'logout',
  ERROR: 'error'
};

// Usage examples:
// analytics.trackPageView('Home');
// analytics.trackEvent(EVENT_TYPES.BUTTON_CLICK, { button_id: 'book-now' });
// analytics.trackBooking(bookingData);