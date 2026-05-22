// Frontend/src/components/user/UserDashboard.jsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/userApi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/UserDashboard.css';
import { authStorage } from '../../api/apiClient';
import API_CONFIG from '../../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUserCircle, faUser, faArrowRight, faCheck, faCancel, faBook, faClock, faLocation, faRupeeSign, faNoteSticky, faRupee, faInr, faLock, faBell, faPhone, faStar, faGear, faList, faBug, faArrowRightArrowLeft, faComment} from "@fortawesome/free-solid-svg-icons";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [verificationCodes, setVerificationCodes] = useState({});
  const [loadingCode, setLoadingCode] = useState(null);
  // Support Modal
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedBookingForSupport, setSelectedBookingForSupport] = useState(null);
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    issueType: 'booking_issue',
    issueDescription: '',
    bookingId: ''
  });
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [userTickets, setUserTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [reviewStatus, setReviewStatus] = useState({});

  const [sessionTimeLeft, setSessionTimeLeft] = useState('');


  // Add useEffect to check session time
  useEffect(() => {
    const checkSessionTime = () => {
      const { token } = authStorage.getAuth('user');

      if (!token) {
        setSessionTimeLeft('00:00:00');
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        const remaining = expiry - Date.now();

        if (remaining > 0) {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

          const formattedTime =
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');

          setSessionTimeLeft(formattedTime);
        } else {
          setSessionTimeLeft('00:00:00');

          // ✅ Optional: auto logout when expired
          authStorage.clearAuth('user');
          logout();
          navigate('/user/login');
        }

      } catch (e) {
        console.error('Token decode error:', e);
        setSessionTimeLeft('Invalid');
      }
    };

    checkSessionTime();
    const interval = setInterval(checkSessionTime, 1000); // Update every minute

    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    console.log('🔄 UserDashboard mounted');
    console.log('Auth user:', user);
    loadBookings();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      bookings.forEach(booking => {
        if (booking.status === 'completed') {
          checkCanReview(booking._id);
        }
      });
    }
  }, [bookings]);

  const loadBookings = async () => {
    try {
      console.log('📡 Loading user bookings...');
      setLoading(true);

      const result = await userApi.getBookings();
      console.log('✅ Bookings loaded:', result);

      if (result.success) {
        setBookings(result.bookings || []);
      } else {
        setError(result.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      setError('Failed to load bookings. Please try again.');

      // Show demo data for testing
      setBookings(getDemoBookings());
    } finally {
      setLoading(false);
    }
  };

  const getDemoBookings = () => {
    return [
      {
        _id: '1',
        name: 'Demo Booking',
        serviceId: { name: 'Ganesh Puja', price: '₹1499/-' },
        panditId: { name: 'Pandit Rajesh' }, // added for rating demo
        dateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        address: '123 Demo Street, Pune',
        status: 'confirmed',
        price: '₹1499/-'
      },
      {
        _id: '2',
        name: 'Test Booking',
        serviceId: { name: 'Satya Narayan Puja', price: '₹1099/-' },
        panditId: { name: 'Pandit Suresh' },
        dateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        address: '456 Test Road, Mumbai',
        status: 'completed',
        price: '₹1099/-'
      }
    ];
  };

  const handleLogout = () => {
    authStorage.clearAuth('user');
    logout();
    navigate('/');
  };

  const cancelBooking = async (bookingId) => {
    try {
      const { token } = authStorage.getAuth('user');

      // First check refund eligibility
      const eligibilityRes = await fetch(`${API_CONFIG.BASE_URL}/payment/refund-eligibility/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eligibility = await eligibilityRes.json();

      let confirmMessage = 'Are you sure you want to cancel this booking?\n\n';

      if (eligibility.eligible) {
        confirmMessage += `✅ You are eligible for ${eligibility.percentage}% refund.\n`;
        confirmMessage += `💰 Refund Amount: ₹${eligibility.refundAmount}\n`;
        confirmMessage += `📝 Reason: ${eligibility.reason}\n\n`;
      } else {
        confirmMessage += `⚠️ No refund applicable.\n`;
        confirmMessage += `📝 Reason: ${eligibility.reason}\n\n`;
      }
      confirmMessage += 'Do you want to proceed?';

      if (!window.confirm(confirmMessage)) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}/payment/cancel-booking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingId, userId: user?.id })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        loadBookings();
      } else {
        alert('Failed to cancel: ' + result.message);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Error cancelling booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'upcoming':
        return ['pending', 'notified', 'accepted', 'confirmed'].includes(booking.status);
      case 'completed':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const fetchVerificationCode = async (bookingId) => {
    try {
      setLoadingCode(bookingId);
      const { token } = authStorage.getAuth('user');
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/user/bookings/${bookingId}/verification-code`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      console.log('Verification code response:', data);
      if (data.success && data.data.showCode) {
        setVerificationCodes(prev => ({
          ...prev,
          [bookingId]: {
            verificationCode: data.data.verificationCode,
            expiresAt: data.data.expiresAt
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching verification code:', error);
    } finally {
      setLoadingCode(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'accepted':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'pending':
      case 'notified':
        return 'status-pending';
      default:
        return '';
    }
  };

  const checkCanReview = async (bookingId) => {
    try {
      const { token } = authStorage.getAuth('user');
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/can-review/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReviewStatus(prev => ({ ...prev, [bookingId]: data.canReview }));
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

  const openRatingModal = (booking) => {
    setSelectedBookingForRating(booking);
    setRatingValue(5);
    setRatingReview('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!ratingValue) {
      alert('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      const { token } = authStorage.getAuth('user');
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: selectedBookingForRating._id,
          rating: ratingValue,
          review: ratingReview
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Thank you for your review!');
        setShowRatingModal(false);
        loadBookings();
      } else {
        alert('❌ Failed to submit review: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setSubmittingRating(false);
    }
  };

  const openSupportModal = (booking = null) => {
    setSelectedBookingForSupport(booking);
    setSupportForm({
      name: user?.name || '',
      email: user?.email || '',
      issueType: 'booking_issue',
      issueDescription: '',
      bookingId: booking?._id || ''
    });
    setShowSupportModal(true);
    setSupportSubmitted(false);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();

    if (!supportForm.issueDescription.trim()) {
      alert('Please describe your issue');
      return;
    }

    setSubmittingSupport(true);

    try {
      const { token } = authStorage.getAuth('user');

      const response = await fetch(`${API_CONFIG.BASE_URL}/user/support-ticket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supportForm)
      });

      const data = await response.json();
      console.log('Support ticket response:', data);

      if (data.success) {
        setSupportSubmitted(true);
        setTimeout(() => {
          setShowSupportModal(false);
          setSupportSubmitted(false);
          setSupportForm({
            name: user?.name || '',
            email: user?.email || '',
            issueType: 'booking_issue',
            issueDescription: '',
            bookingId: ''
          });
        }, 3000);
      } else {
        alert('Failed to submit: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      alert('Error submitting support ticket. Please try again.');
    } finally {
      setSubmittingSupport(false);
    }
  };

  const fetchUserTickets = async () => {
    try {
      setLoadingTickets(true);
      const { token } = authStorage.getAuth('user');

      const response = await fetch(`${API_CONFIG.BASE_URL}/user/support-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('User tickets:', data);

      if (data.success) {
        setUserTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1><FontAwesomeIcon icon={faUser } /> User Dashboard</h1>
          <div className="user-info">
            <p>Welcome, <strong>{user?.name || 'User'}</strong></p>
            <p>{user?.email || 'user@example.com'} • {user?.phone || 'Not provided'}</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/services')} className="btn-book">
            <FontAwesomeIcon icon={faCalendar } /> Book New Service
          </button>
          <button onClick={handleLogout} className="btn-logout">
            <FontAwesomeIcon icon={faArrowRight } /> Logout
          </button>


        </div>
        <div className="session-timer">
          <i className="bx bx-time"></i> Session: {sessionTimeLeft}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0',
          border: '1px solid #ffeaa7'
        }}>
          ⚠️ {error}
          <button
            onClick={loadBookings}
            style={{
              marginLeft: '15px',
              padding: '5px 10px',
              background: '#856404',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-cards">
        <div className="stat-card">
          <h3>{bookings.filter(b => ['pending', 'notified', 'accepted', 'confirmed'].includes(b.status)).length}</h3>
          <p>Upcoming</p>
        </div>
        <div className="stat-card">
          <h3>{bookings.filter(b => b.status === 'completed').length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{bookings.filter(b => b.status === 'cancelled').length}</h3>
          <p>Cancelled</p>
        </div>
        <div className="stat-card">
          <h3>{bookings.filter(b => b.paymentStatus === 'completed').length}</h3>
          <p>Paid Bookings</p>
        </div>
        <div className="stat-card">
          <h3>{bookings.length}</h3>
          <p>Total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'upcoming' ? 'active' : ''}
          onClick={() => setActiveTab('upcoming')}
        >
          <FontAwesomeIcon icon={faCalendar } /> Upcoming
        </button>
        <button
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTab('completed')}
        >
          <FontAwesomeIcon icon={faCheck } /> Completed
        </button>
        <button
          className={activeTab === 'cancelled' ? 'active' : ''}
          onClick={() => setActiveTab('cancelled')}
        >
          <FontAwesomeIcon icon={faCancel } /> Cancelled
        </button>
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          <FontAwesomeIcon icon={faBook } /> All
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-section">
        <h2>Your Bookings ({filteredBookings.length})</h2>

        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <p>No bookings found</p>
            <button onClick={() => navigate('/services')} className="btn-primary">
              Book Your First Service
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.serviceId?.name || 'Unknown Service'}</h3>
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {booking.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>

                <div className="booking-details">
                  <p><strong><FontAwesomeIcon icon={faCalendar } /> Date:</strong> {new Date(booking.dateTime).toLocaleDateString()}</p>
                  <p><strong><FontAwesomeIcon icon={faClock } /> Time:</strong> {new Date(booking.dateTime).toLocaleTimeString()}</p>
                  <p><strong><FontAwesomeIcon icon={faLocation } /> Address:</strong> {booking.address || 'Not specified'}</p>
                  <p><strong><FontAwesomeIcon icon={faInr } /> Price:</strong> {booking.price || booking.serviceId?.price || 'N/A'}</p>
                  {booking.message && <p><strong><FontAwesomeIcon icon={faNoteSticky } /> Note:</strong> {booking.message}</p>}
                </div>
                <div className="payment-info" style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: booking.paymentStatus === 'completed' ? '#d4edda' : '#fff3cd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}>
                  <strong><FontAwesomeIcon icon={faInr } /> Payment:</strong>{' '}
                  {booking.paymentStatus === 'completed' ? (
                    <span style={{ color: '#28a745' }}>
                      <FontAwesomeIcon icon={faCheck } /> Advance Paid - ₹{booking.advanceAmount || 'N/A'}
                    </span>
                  ) : (
                    <span style={{ color: '#ffc107' }}>
                      <FontAwesomeIcon icon={faClock } /> Pending Payment
                    </span>
                  )}
                </div>

                

                {['accepted', 'confirmed'].includes(booking.status) && (
                  <div className="verification-section" style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: '#f0f7ff',
                    borderRadius: '8px',
                    border: '1px solid #cce5ff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#004085' }}><FontAwesomeIcon icon={faLock } /> Puja Verification</h4>
                      <button
                        onClick={() => fetchVerificationCode(booking._id)}
                        disabled={loadingCode === booking._id}
                        style={{
                          padding: '8px 16px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: loadingCode === booking._id ? 'not-allowed' : 'pointer',
                          opacity: loadingCode === booking._id ? 0.7 : 1
                        }}
                      >
                        {loadingCode === booking._id ? 'Loading...' : 'Show Verification Code'}
                      </button>
                    </div>

                    {verificationCodes[booking._id] && (
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: 'white',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '2px solid #28a745'
                      }}>
                        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#28a745' }}>
                          <FontAwesomeIcon icon={faCheck } /> Verification Code Ready
                        </p>
                        <div style={{
                          fontSize: '42px',
                          fontWeight: 'bold',
                          letterSpacing: '8px',
                          background: '#f8f9fa',
                          padding: '15px',
                          borderRadius: '8px',
                          fontFamily: 'monospace',
                          marginBottom: '10px'
                        }}>
                          {verificationCodes[booking._id].verificationCode}
                        </div>
                        {verificationCodes[booking._id].expiresAt && (
                          <p style={{ fontSize: '12px', color: '#856404', margin: '5px 0' }}>
                            <FontAwesomeIcon icon={faClock } /> Valid until: {new Date(verificationCodes[booking._id].expiresAt).toLocaleString()}
                          </p>
                        )}
                        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                          <FontAwesomeIcon icon={faBell } /> Please share this code with your pandit to complete the puja.
                        </p>
                      </div>
                    )}

                    {!verificationCodes[booking._id] && (
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                        Click "Show Verification Code" to get the code. Share it with your pandit when they ask.
                      </p>
                    )}
                  </div>
                )}

                <div className="booking-actions">
                  {['pending', 'notified', 'accepted', 'confirmed'].includes(booking.status) && (
                    <button onClick={() => cancelBooking(booking._id)} className="btn-cancel">
                      <FontAwesomeIcon icon={faCancel } /> Cancel
                    </button>
                  )}
                  <button onClick={() => openSupportModal(booking)} className="btn-contact">
                    <FontAwesomeIcon icon={faPhone } /> Contact Support
                  </button>
                  {booking.status === 'completed' && reviewStatus[booking._id] === true && (
                    <button onClick={() => openRatingModal(booking)} className="btn-rate">
                      <FontAwesomeIcon icon={faStar } /> Rate Pandit
                    </button>
                  )}

                  {booking.status === 'completed' && reviewStatus[booking._id] === false && (
                    <span className="already-rated"><FontAwesomeIcon icon={faCheck } /> Rated</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <h2>Quick Actions</h2>
        <div className="links-grid">
          <button onClick={() => navigate('/services')} className="link-card">
            <span><FontAwesomeIcon icon={faCalendar } /></span>
            <h3>Book Service</h3>
            <p>Schedule a new puja</p>
          </button>

          <button onClick={() => navigate('/find-pandit')} className="link-card">
            <span><FontAwesomeIcon icon={faUser } /></span>
            <h3>Find Pandits</h3>
            <p>Browse available pandits</p>
          </button>

          <button onClick={() => alert('Profile update coming soon!')} className="link-card">
            <span><FontAwesomeIcon icon={faGear } /></span>
            <h3>Profile</h3>
            <p>Update your information</p>
          </button>

          <button onClick={() => openSupportModal()} className="link-card">
            <span><FontAwesomeIcon icon={faPhone } /></span>
            <h3>Contact Support</h3>
            <p>Report an issue or complaint</p>
          </button>

          {/* ✅ My Tickets button correctly placed here */}
          <button onClick={() => { fetchUserTickets(); setShowTicketsModal(true); }} className="link-card">
            <span><FontAwesomeIcon icon={faList } /></span>
            <h3>My Tickets</h3>
            <p>Track support requests</p>
          </button>
        </div>
      </div>

      {/* Contact Support Modal */}
      {showSupportModal && (
        <div className="modal-overlay" onClick={() => !submittingSupport && setShowSupportModal(false)}>
          <div className="modal-content support-modal" onClick={e => e.stopPropagation()}>
            {!supportSubmitted ? (
              <>
                <div className="modal-header">
                  <h3><FontAwesomeIcon icon={faPhone } /> Contact Support</h3>
                  <button className="close-btn" onClick={() => setShowSupportModal(false)} disabled={submittingSupport}>✕</button>
                </div>
                <form onSubmit={handleSupportSubmit}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={supportForm.name} onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })} required disabled={submittingSupport} />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" value={supportForm.email} onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })} required disabled={submittingSupport} />
                  </div>
                  <div className="form-group">
                    <label>Issue Type *</label>
                    <select value={supportForm.issueType} onChange={(e) => setSupportForm({ ...supportForm, issueType: e.target.value })} required disabled={submittingSupport}>
                      <option value="booking_issue"><FontAwesomeIcon icon={faCalendar } /> Booking Issue</option>
                      <option value="payment_issue"><FontAwesomeIcon icon={faInr } /> Payment Issue</option>
                      <option value="technical_bug"><FontAwesomeIcon icon={faBug } /> Technical Bug</option>
                      <option value="pandit_issue">👨<FontAwesomeIcon icon={faUser } /> Pandit Related Issue</option>
                      <option value="cancellation"><FontAwesomeIcon icon={faCancel } /> Cancellation Request</option>
                      <option value="refund"><FontAwesomeIcon icon={faArrowRightArrowLeft } /> Refund Request</option>
                      <option value="other"><FontAwesomeIcon icon={faList } /> Other</option>
                    </select>
                  </div>
                  {selectedBookingForSupport && (
                    <div className="form-group">
                      <label>Related Booking</label>
                      <div className="booking-info-box">
                        <p><strong>Booking ID:</strong> {selectedBookingForSupport._id}</p>
                        <p><strong>Service:</strong> {selectedBookingForSupport.serviceId?.name}</p>
                        <p><strong>Date:</strong> {new Date(selectedBookingForSupport.dateTime).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {selectedBookingForSupport.status}</p>
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Describe Your Issue *</label>
                    <textarea rows="5" value={supportForm.issueDescription} onChange={(e) => setSupportForm({ ...supportForm, issueDescription: e.target.value })} placeholder="Please provide detailed information about your issue..." required disabled={submittingSupport} />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowSupportModal(false)} className="btn-cancel" disabled={submittingSupport}>Cancel</button>
                    <button type="submit" className="btn-submit" disabled={submittingSupport}>{submittingSupport ? 'Submitting...' : 'Submit Ticket'}</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="support-success">
                <div className="success-icon"><FontAwesomeIcon icon={faCheck } /></div>
                <h3>Ticket Submitted Successfully!</h3>
                <p>Thank you for contacting support. Our team will get back to you within 24 hours.</p>
                <p><strong>Ticket ID:</strong> #{Math.floor(Math.random() * 1000000)}</p>
                <button onClick={() => setShowSupportModal(false)} className="btn-close">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedBookingForRating && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="modal-content rating-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FontAwesomeIcon icon={faStar } /> Rate Your Pandit</h3>
              <button className="close-btn" onClick={() => setShowRatingModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Service:</strong> {selectedBookingForRating.serviceId?.name}</p>
              <p><strong>Pandit:</strong> {selectedBookingForRating.panditId?.name || 'Pandit'}</p>
              <p><strong>Date:</strong> {new Date(selectedBookingForRating.dateTime).toLocaleDateString()}</p>
              <div className="rating-stars-input">
                <label>Your Rating:</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} onClick={() => setRatingValue(star)} style={{ fontSize: '32px', cursor: 'pointer', color: star <= ratingValue ? '#ffc107' : '#e4e5e9', marginRight: '5px' }}>★</span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review (Optional):</label>
                <textarea rows="4" value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} placeholder="Share your experience with the pandit..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowRatingModal(false)} className="btn-cancel">Cancel</button>
              <button onClick={submitRating} disabled={submittingRating} className="btn-submit">{submittingRating ? 'Submitting...' : 'Submit Rating'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Tickets Modal - correctly placed inside return */}
      {showTicketsModal && (
        <div className="modal-overlay" onClick={() => setShowTicketsModal(false)}>
          <div className="modal-content tickets-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FontAwesomeIcon icon={faList } /> My Support Tickets</h3>
              <button className="close-btn" onClick={() => setShowTicketsModal(false)}>✕</button>
            </div>
            {loadingTickets ? (
              <LoadingSpinner text="Loading tickets..." />
            ) : userTickets.length === 0 ? (
              <div className="no-tickets">
                <p>No support tickets found.</p>
                <p>When you contact support, your tickets will appear here.</p>
              </div>
            ) : (
              <div className="user-tickets-list">
                {userTickets.map(ticket => (
                  <div key={ticket._id} className="user-ticket-card">
                    <div className="ticket-header">
                      <div className="ticket-title">
                        <span className="ticket-id">#{ticket._id.toString().slice(-8)}</span>
                        <span className={`ticket-status-badge ${ticket.status}`}>
                          {ticket.status === 'open' && '🟡 Open'}
                          {ticket.status === 'in_progress' && '🔵 In Progress'}
                          {ticket.status === 'resolved' && '✅ Resolved'}
                          {ticket.status === 'closed' && '⚫ Closed'}
                        </span>
                      </div>
                      <div className="ticket-date">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="ticket-body">
                      <p><strong>Issue:</strong> {ticket.issueType.replace('_', ' ').toUpperCase()}</p>
                      <p><strong>Description:</strong> {ticket.issueDescription}</p>
                      {ticket.adminResponse && (
                        <div className="admin-response">
                          <strong><FontAwesomeIcon icon={faComment } /> Admin Response:</strong>
                          <p>{ticket.adminResponse}</p>
                        </div>
                      )}
                      {ticket.resolvedAt && <p className="resolved-date"><FontAwesomeIcon icon={faCheck } /> Resolved on: {new Date(ticket.resolvedAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-close-modal" onClick={() => setShowTicketsModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;