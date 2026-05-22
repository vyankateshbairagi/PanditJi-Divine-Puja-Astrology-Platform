// Frontend/src/components/user/BookingDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
// import '../../styles/BookingDetails.css';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const result = await userApi.getBookings();
      const foundBooking = result.bookings?.find(b => b._id === bookingId);
      
      if (foundBooking) {
        setBooking(foundBooking);
      } else {
        setError('Booking not found');
      }
    } catch (error) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading booking details..." />;
  if (error) return <div className="error-message">⚠️ {error}</div>;

  return (
    <div className="booking-details-page">
      <button onClick={() => navigate('/user/dashboard')} className="back-btn">
        ← Back to Dashboard
      </button>
      
      <div className="booking-details-card">
        <h2>Booking Details</h2>
        
        <div className="detail-section">
          <h3>Service Information</h3>
          <p><strong>Service:</strong> {booking.serviceId?.name}</p>
          <p><strong>Description:</strong> {booking.serviceId?.description}</p>
          <p><strong>Category:</strong> {booking.serviceId?.category}</p>
          <p><strong>Price:</strong> {booking.price}</p>
        </div>
        
        <div className="detail-section">
          <h3>Booking Information</h3>
          <p><strong>Booking ID:</strong> {booking._id}</p>
          <p><strong>Status:</strong> <span className={`status-badge status-${booking.status}`}>{booking.status.toUpperCase()}</span></p>
          <p><strong>Date:</strong> {new Date(booking.dateTime).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {new Date(booking.dateTime).toLocaleTimeString()}</p>
          <p><strong>Address:</strong> {booking.address}</p>
        </div>
        
        {booking.panditId && (
          <div className="detail-section">
            <h3>Assigned Pandit</h3>
            <p><strong>Name:</strong> {booking.panditId.name}</p>
            <p><strong>Contact:</strong> {booking.panditId.contact}</p>
            <p><strong>Rating:</strong> ⭐{booking.panditId.rating}</p>
            <p><strong>Experience:</strong> {booking.panditId.experience} years</p>
          </div>
        )}
        
        <div className="action-buttons">
          {['pending', 'notified', 'accepted', 'confirmed'].includes(booking.status) && (
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this booking?')) {
                  userApi.cancelBooking(booking._id)
                    .then(() => {
                      alert('Booking cancelled successfully');
                      navigate('/user/dashboard');
                    })
                    .catch(err => alert('Failed to cancel: ' + err.message));
                }
              }}
              className="btn-cancel"
            >
              Cancel Booking
            </button>
          )}
          
          <button 
            onClick={() => window.location.href = `tel:+919373120370`}
            className="btn-call"
          >
            📞 Call Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;