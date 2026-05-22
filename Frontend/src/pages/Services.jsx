// Frontend/src/pages/Services.jsx - CORRECTED VERSION
import React, { useState, useEffect } from "react";
import BookingForm from '../components/common/BookingForm';
import Popup from "../pages/pujaDetails/PopUp";
import { serviceApi } from "../api/serviceApi";
import { useAuth } from "../context/AuthContext";
// import LoadingSpinner from '../components/common/LoadingSpinner';
import BookNowButton from '../components/common/BookNowButton';
import Skeleton from '../components/common/Skeleton';
import { useLanguage } from '../context/LanguageContext';

const Services = () => {
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [pendingBooking, setPendingBooking] = useState(null);
  const [error, setError] = useState("");

  // Load services on component mount
  useEffect(() => {
    console.log('🔄 Services component mounted');
    loadServices();

    // Listen for booking events from ProtectedBooking
    const handleOpenBooking = (event) => {
      console.log('🎯 Received openBooking event:', event.detail);
      openBooking(event.detail);
    };

    window.addEventListener('openBooking', handleOpenBooking);

    return () => {
      window.removeEventListener('openBooking', handleOpenBooking);
    };
  }, []);

  useEffect(() => {
    // Check for pending booking when user logs in
    if (isAuthenticated) {
      const savedBooking = localStorage.getItem('pendingBooking');
      if (savedBooking) {
        try {
          const bookingData = JSON.parse(savedBooking);
          setPendingBooking(bookingData);

          // Ask user if they want to continue booking
          if (window.confirm(t('pendingBookingPrompt'))) {
            openBooking(bookingData.service);
          }

          // Clear pending booking
          localStorage.removeItem('pendingBooking');
        } catch (error) {
          console.error('Error parsing pending booking:', error);
        }
      }
    }
  }, [isAuthenticated]);

  // ✅ CORRECTED: Simple loadServices function (no BookingForm code)
  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await serviceApi.getActiveServices();
      setServices(data);
    } catch (error) {
      console.error('Error:', error);
      setServices(getFallbackServices());
    } finally {
      setLoading(false);
    }
  };

  // Fallback services if API fails
  const getFallbackServices = () => {
    return [];
  };

  // Open booking for specific service
  const openBooking = (service) => {
    console.log("📞 Opening booking for:", service?.name);
    if (service) {
      setSelectedServiceForBooking(service);
      setSelectedServiceForDetails(null);
    }
  };

  // Open details for specific service
  const openDetails = (service) => {
    console.log("📖 Opening details for:", service.name);
    setSelectedServiceForDetails(service);
    setSelectedServiceForBooking(null);
  };

  // Close booking form
  const closeBooking = () => {
    setSelectedServiceForBooking(null);
  };

  // Close details popup
  const closeDetails = () => {
    setSelectedServiceForDetails(null);
  };

  // Handle successful booking
  const handleBookingSuccess = (booking) => {
    console.log("✅ Booking successful:", booking);
    setSelectedServiceForBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-16">
        <h2 className="mb-10 text-center text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-amber-600">{t('ourServices')}</h2>
        <Skeleton.FilterBar />
        <Skeleton.ServicesGrid count={6} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-16">
      <div className="flex items-center justify-center">
        <h2 className="text-center text-4xl sm:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-amber-600">{t('ourServices')}</h2>
      </div>

      {error && (
        <div className="error-message" style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          {error}
        </div>
      )}

      <div className="grid w-full max-w-[1600px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mx-auto">
        {services.length === 0 ? (
          <div className="col-span-1 w-full bg-gray-50 rounded-2xl p-10 text-center">
            <p className="mb-4 text-gray-600">{t('noServicesAvailable')}</p>
            <button onClick={loadServices} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-maroon1 to-brand-maroon2 px-4 py-3 text-sm font-semibold text-white">{t('tryAgain')}</button>
          </div>
        ) : (
          services.map((service) => (
            <div key={service._id || service.id} className="group relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md border border-white/30 shadow-lg transition-transform hover:-translate-y-2 hover:shadow-2xl">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.src = "/images/default-puja.jpg"; }}
              />
              <div className="p-5">
                <h3 className="mb-2 text-lg font-serif font-bold text-[#642627]">{service.name}</h3>
                <p className="mb-4 text-sm text-gray-600 leading-relaxed">{service.description}</p>
                <p className="mb-4 inline-block rounded-full bg-amber-50/60 px-4 py-2 text-lg font-bold text-amber-800">{service.price}</p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <BookNowButton service={service} onBookClick={openBooking} />
                  </div>
                  <button onClick={() => openDetails(service)} className="flex-1 min-w-[140px] rounded-full border-2 border-[#642627] px-4 py-3 text-sm font-semibold text-[#642627] hover:bg-[#642627] hover:text-white transition">{t('viewDetails')}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Form Modal */}
      {selectedServiceForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeBooking}>
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <button className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:rotate-90" onClick={closeBooking}>X</button>
            <BookingForm
              service={selectedServiceForBooking}
              onClose={closeBooking}
              onSuccess={handleBookingSuccess}
            />
          </div>
        </div>
      )}

      {/* Service Details Popup */}
      {selectedServiceForDetails && (
        <Popup service={selectedServiceForDetails} onClose={closeDetails} />
      )}
    </div>
  );
};

export default Services;