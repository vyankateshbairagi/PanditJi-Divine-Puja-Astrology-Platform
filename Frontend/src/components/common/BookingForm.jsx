// Frontend/src/components/common/BookingForm.jsx - COMPLETE FIXED VERSION
import React, { useEffect, useState } from "react";
import { bookingApi } from "../../api/bookingApi";
import { panditApi } from "../../api/panditApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner, { InlineSpinner } from '../common/LoadingSpinner';
import { analytics } from '../../utils/analytics';
import { serviceApi } from "../../api/serviceApi";
import RazorpayPayment from './RazorpayPayment';
import { authStorage } from '../../api/apiClient';
import API_CONFIG from '../../config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const extractPrice = (priceString) => {
  if (!priceString) return 0;
  const match = priceString.toString().match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

export default function BookingForm({ service, pandit, onSuccess, onClose }) {
  useEffect(() => {
    // Ensure global chrome (header/footer) hidden when the booking form is mounted
    document.body.classList.add('hide-header');
    return () => {
      document.body.classList.remove('hide-header');
    };
  }, []);
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    dateTime: "",
    address: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [panditLocations, setPanditLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [cityError, setCityError] = useState('');

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        contact: user.phone || ""
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadServices();
    loadPanditLocations();
  }, []);

  useEffect(() => {
    if (service) {
      setSelectedService(service);
    }
  }, [service]);

  useEffect(() => {
    const restorePendingBooking = async () => {
      if (isAuthenticated && user) {
        const savedBooking = localStorage.getItem('pendingBooking');
        if (savedBooking) {
          try {
            const bookingData = JSON.parse(savedBooking);
            console.log('🔄 Restoring pending booking:', bookingData);
            
            if (bookingData.formData) {
              setForm(bookingData.formData);
            }
            
            if (bookingData.selectedCity) {
              setSelectedCity(bookingData.selectedCity);
            }
            
            if (bookingData.service) {
              setSelectedService(bookingData.service);
            } else if (bookingData.serviceId) {
              const service = await serviceApi.getServiceById(bookingData.serviceId);
              setSelectedService(service);
            }
            
            localStorage.removeItem('pendingBooking');
            toast?.success('Your booking information has been restored!');
          } catch (error) {
            console.error('Error restoring pending booking:', error);
            localStorage.removeItem('pendingBooking');
          }
        }
      }
    };
    
    restorePendingBooking();
  }, [isAuthenticated, user]);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await serviceApi.getActiveServices();
      setServices(data);

      if (service) {
        setSelectedService(service);
      } else if (data.length > 0) {
        setSelectedService(data[0]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadPanditLocations = async () => {
    try {
      setLoadingLocations(true);
      const data = await panditApi.getPanditLocations();
      setPanditLocations(data.locations || []);
    } catch (error) {
      console.error('Error loading pandit locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedService) newErrors.service = 'Please select a puja/service';
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(form.contact)) {
      newErrors.contact = 'Please enter a valid 10-digit contact number';
    }
    if (!form.dateTime) newErrors.dateTime = 'Date and time is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.address.trim() || form.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address (minimum 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCity = () => {
    if (!selectedCity) {
      setCityError('Please select a city where you want the pandit');
      return false;
    }
    setCityError('');
    return true;
  };

  const voidBooking = async (bookingId) => {
    try {
      const { token } = authStorage.getAuth('user');
      await fetch(`${API_CONFIG.BASE_URL}/user/bookings/${bookingId}/void`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to void booking:', err);
    }
  };

  const handlePaymentCancel = async () => {
    if (createdBookingId) {
      await voidBooking(createdBookingId);
    }
    setShowPayment(false);
    setCreatedBookingId(null);
    setTotalAmount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      const bookingData = {
        serviceId: selectedService?._id,
        service: selectedService,
        panditId: pandit?._id,
        pandit: pandit,
        formData: form,
        selectedCity: selectedCity,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      localStorage.setItem('previousPage', window.location.pathname);
      alert('🔐 Please login or register to complete your booking. Your information has been saved.');
      navigate('/user/login');
      return;
    }

    if (!validateForm()) return;
    if (!validateCity()) return;

    setLoading(true);
    try {
      const priceValue = extractPrice(selectedService?.price);
      const totalPrice = priceValue;
      
      const payload = {
        name: form.name,
        contact: form.contact,
        email: form.email,
        serviceId: selectedService?._id,
        panditId: pandit?._id || null,
        dateTime: form.dateTime,
        address: form.address,
        userLocation: selectedCity,
        message: form.message,
        price: selectedService?.price,
        totalAmount: totalPrice
      };

      const result = await bookingApi.createBooking(payload);

      if (result.success) {
        analytics.trackBooking(result.booking);
        setCreatedBookingId(result.booking._id);
        setTotalAmount(totalPrice);
        setShowPayment(true);
        localStorage.removeItem('pendingBooking');
      } else {
        alert("❌ Booking failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert("❌ Booking failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const displayService = selectedService || service;
  const displayPrice = displayService?.price || 'Price on request';
  const advanceAmount = totalAmount ? Math.round(totalAmount * 0.3) : 0;

  // Save booking data helper function
  const saveBookingData = () => {
    const formDataToSave = {
      serviceId: selectedService?._id,
      service: selectedService,
      panditId: pandit?._id,
      pandit: pandit,
      formData: form,
      selectedCity: selectedCity,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('pendingBooking', JSON.stringify(formDataToSave));
    localStorage.setItem('previousPage', window.location.pathname);
  };



  return (
    <div className="mx-auto flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-[20px] bg-[#fffaf4] border border-[#ead7bf] font-sans shadow-[0_8px_30px_rgba(102,64,43,0.12)]">
      <div className="sticky top-0 z-[101] flex items-center justify-between border-b border-[#f0e0c4] bg-[linear-gradient(#fffaf4,#fff6f0)] px-5 py-4">
        <h3 className="m-0 text-[clamp(1.2rem,5vw,1.5rem)] font-semibold text-slate-800">
          Book: {pandit?.name || 'Pandit'} - {displayService?.name || 'Select Service'}
        </h3>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent text-2xl text-slate-500 transition hover:bg-slate-100 hover:rotate-90"
          onClick={onClose}
          aria-label="Close booking form"
          type="button"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-28 sm:px-6">
        <div className="space-y-5">
          {!isAuthenticated && (
            <div className="mb-6 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4 text-amber-900 shadow-sm">
              <p className="mb-2 font-bold text-amber-900">🔐 Please login or register to book this service</p>
              <p className="mb-4 text-sm leading-6 text-amber-800">
                Your booking information will be saved. After login, you can continue where you left off.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  onClick={() => {
                    saveBookingData();
                    navigate('/user/login');
                  }}
                  className="min-h-12 flex-1 rounded-lg border-0 bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-90 sm:min-w-[120px]"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    saveBookingData();
                    navigate('/user/register');
                  }}
                  className="min-h-12 flex-1 rounded-lg border-0 bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-90 sm:min-w-[120px]"
                >
                  Register
                </button>
                <button onClick={onClose} type="button" className="min-h-12 flex-1 rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200 sm:min-w-[120px]">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Service Selection */}
          <div className="space-y-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">Select Puja/Service *</label>
            <select
              className={`w-full rounded-lg border-2 bg-slate-50 px-4 py-3 text-base transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 ${selectedService ? 'border-slate-200' : 'border-blue-500'}`}
              value={selectedService?._id || ''}
              onChange={(e) => {
                const service = services.find(s => s._id === e.target.value);
                setSelectedService(service);
              }}
              required
              disabled={loadingServices}
            >
              <option value="">-- Select a Puja/Service --</option>
              {services.map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} - {s.price}
                </option>
              ))}
            </select>
            {!selectedService && <span className="block text-xs font-medium text-red-600">Please select a service</span>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Your Name *</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={`w-full rounded-lg border-2 px-4 py-3 text-base transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
                disabled={isAuthenticated}
              />
              {errors.name && <span className="mt-2 block text-xs font-medium text-red-600">{errors.name}</span>}
              {isAuthenticated && <small className="mt-1 block text-xs italic leading-5 text-slate-500">Auto-filled from your profile</small>}
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Contact (Mobile) *</span>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                required
                className={`w-full rounded-lg border-2 px-4 py-3 text-base transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.contact ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
                placeholder="10-digit mobile number"
                disabled={isAuthenticated}
              />
              {errors.contact && <span className="mt-2 block text-xs font-medium text-red-600">{errors.contact}</span>}
              {isAuthenticated && <small className="mt-1 block text-xs italic leading-5 text-slate-500">Auto-filled from your profile</small>}
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Email *</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full rounded-lg border-2 px-4 py-3 text-base transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
                placeholder="your@email.com"
                required
                disabled={isAuthenticated}
              />
              {errors.email && <span className="mt-2 block text-xs font-medium text-red-600">{errors.email}</span>}
              {isAuthenticated && <small className="mt-1 block text-xs italic leading-5 text-slate-500">Auto-filled from your profile</small>}
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Date & Time *</span>
              <input
                name="dateTime"
                type="datetime-local"
                value={form.dateTime}
                onChange={handleChange}
                required
                className={`w-full rounded-lg border-2 px-4 py-3 text-base transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.dateTime ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
              />
              {errors.dateTime && <span className="mt-2 block text-xs font-medium text-red-600">{errors.dateTime}</span>}
            </label>

            <div className="space-y-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">Select City for Puja *</label>
              <select
                className={`w-full rounded-lg border-2 bg-slate-50 px-4 py-3 text-base transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 ${cityError ? 'border-red-500' : 'border-slate-200 hover:border-slate-300'}`}
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCityError('');
                }}
                required
                disabled={loadingLocations}
              >
                <option value="">-- Select a City --</option>
                {panditLocations.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {cityError && <span className="block text-xs font-medium text-red-600">{cityError}</span>}
              {panditLocations.length === 0 && !loadingLocations && (
                <small className="block text-xs font-medium text-red-600">
                  ⚠️ No cities available. Please contact support.
                </small>
              )}
              <small className="block text-xs italic leading-5 text-slate-500">
                Pandits are available in these cities only
              </small>
            </div>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Full Address *</span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Complete address with street, area, city, and landmark"
                rows="3"
                required
                className={`w-full rounded-lg border-2 px-4 py-3 text-base transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${errors.address ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
              />
              {errors.address && <span className="mt-2 block text-xs font-medium text-red-600">{errors.address}</span>}
              <small className="mt-1 block text-xs italic leading-5 text-slate-500">Minimum 10 characters required</small>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">Note (Optional)</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Any special requirements or notes..."
                rows="3"
                className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base transition hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </form>
        </div>

        {/* Form Actions - ALWAYS VISIBLE at bottom */}
        <div className="sticky bottom-0 z-[10001] mt-4 flex flex-wrap gap-3 border-t-2 border-slate-200 bg-white px-5 py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sm:flex-nowrap sm:px-6">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !selectedService}
                className="flex min-h-12 min-w-[140px] flex-1 items-center justify-center rounded-lg border-0 bg-gradient-to-br from-[#8f1d34] to-[#7a1024] px-4 py-3 text-sm font-semibold uppercase tracking-[0.5px] text-white shadow-[0_8px_24px_rgba(122,16,36,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {loading ? <InlineSpinner /> : "Confirm Booking"}
          </button>
          <button type="button" onClick={onClose} className="flex min-h-12 min-w-[140px] flex-1 items-center justify-center rounded-lg border-2 border-[#ead7bf] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.5px] text-[#642627] transition hover:-translate-y-0.5 hover:bg-[#fffaf4]">
            Cancel
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && createdBookingId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4" onClick={handlePaymentCancel}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)]" onClick={e => e.stopPropagation()}>
            <h3 className="m-0 text-xl font-semibold text-slate-800">Complete Payment to Confirm Booking</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Pay 30% advance to confirm your booking</p>
            <p className="mt-3 text-base font-semibold text-slate-800">Total Amount: {displayPrice}</p>
            <p className="mt-1 text-base font-semibold text-slate-800">Advance (30%): ₹{advanceAmount}</p>
            <RazorpayPayment
              bookingId={createdBookingId}
              totalAmount={totalAmount}
              onSuccess={() => {
                setShowPayment(false);
                setCreatedBookingId(null);
                alert("✅ Booking confirmed! Payment successful.");
                if (onSuccess) onSuccess();
                if (onClose) onClose();
              }}
              onFailure={handlePaymentCancel}
            />
            <button onClick={handlePaymentCancel} type="button" className="mt-4 inline-flex w-full items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200">Cancel Payment</button>
          </div>
        </div>
      )}
    </div>
  );
}