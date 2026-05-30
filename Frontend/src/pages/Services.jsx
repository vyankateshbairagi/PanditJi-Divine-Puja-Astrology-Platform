// Frontend/src/pages/Services.jsx - CORRECTED VERSION
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BadgeCheck,
  ChevronRight,
  Clock3,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../components/common/BookingForm';
import Popup from "../pages/pujaDetails/PopUp";
import { serviceApi } from "../api/serviceApi";
import { useAuth } from "../context/AuthContext";
// import LoadingSpinner from '../components/common/LoadingSpinner';
import BookNowButton from '../components/common/BookNowButton';
import Skeleton from '../components/common/Skeleton';
import { useLanguage } from '../context/LanguageContext';

const getHighlightLabel = (index) => {
  switch (index) {
    case 0:
      return 'Most Booked';
    case 1:
      return 'Popular';
    case 2:
      return 'Top Rated';
    default:
      return 'Ideal for Families';
  }
};

const ServiceCard = ({ service, index, onBookClick, onDetailsClick, detailsLabel }) => {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#ead7bf] bg-white/95 shadow-[0_14px_40px_rgba(100,38,39,0.08)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(100,38,39,0.14)]" aria-labelledby={`service-${service._id || service.id}`}>
      <div className="relative overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          loading="lazy"
          decoding="async"
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-56 md:h-48 lg:h-56"
          onError={(e) => { e.target.src = "/images/default-puja.jpg"; }}
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#a52240] shadow-sm backdrop-blur">
          <Sparkles size={12} />
          {getHighlightLabel(index)}
        </div>
        <button
          type="button"
          aria-label={`Save ${service.name}`}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#a52240] shadow-sm backdrop-blur transition hover:scale-105"
        >
          <Star size={16} className="fill-current" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 id={`service-${service._id || service.id}`} className="text-[1.05rem] font-semibold text-[#38151c]">{service.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f4a2a]">{service.description}</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#a52240]">Starting at</p>
            <p className="text-2xl font-semibold text-[#642627]">{service.price}</p>
          </div>
          <button
            type="button"
            onClick={() => onDetailsClick(service)}
            className="rounded-full bg-[#fff5ea] px-3 py-1 text-xs font-medium text-[#8b5e2a] transition hover:bg-[#fff0df] hover:text-[#642627]"
            aria-label={`Open details for ${service.name}`}
          >
           View Details
          </button>
        </div>

        <div className="mt-5">
          <BookNowButton service={service} onBookClick={onBookClick} />
        </div>
      </div>
    </article>
  );
};

const CATEGORY_FILTERS = [
  { value: 'all', label: 'all', keywords: [] },
  { value: 'festival', label: 'festival', keywords: ['festival', 'festive'] },
  { value: 'hawan', label: 'hawan', keywords: ['hawan', 'yagya', 'yajna'] },
  { value: 'shanti', label: 'shanti', keywords: ['shanti'] },
  { value: 'shraddha', label: 'shraddha', keywords: ['shraddha'] },
  { value: 'astrology', label: 'astrology', keywords: ['astrology', 'astro', 'kundali', 'horoscope'] },
  { value: 'housewarming', label: 'housewarming', keywords: ['housewarming', 'griha pravesh', 'grih pravesh'] },
  { value: 'shiv', label: 'shiv', keywords: ['shiv', 'shiva', 'mahadev'] },
  { value: 'health', label: 'health', keywords: ['health', 'prosperity', 'wellness'] },
  { value: 'sanskar', label: 'sanskar', keywords: ['sanskar'] },
  { value: 'marriage', label: 'marriage', keywords: ['marriage', 'wedding', 'vivah'] },
  { value: 'career', label: 'career', keywords: ['career', 'job', 'business', 'employment'] },
  { value: 'dosh', label: 'dosh', keywords: ['dosh', 'dosha', 'nazar', 'grah'] },
];

const Services = () => {
  const navigate = useNavigate();
  const pujaCardsRef = useRef(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [pendingBooking, setPendingBooking] = useState(null);
  const [error, setError] = useState("");

  const trustPoints = useMemo(() => [
    { icon: BadgeCheck, label: 'Verified Pandits' },
    { icon: ShieldCheck, label: 'Secure Booking' },
    { icon: Clock3, label: 'On-time Rituals' },
    { icon: Sparkles, label: 'Puja Samagri Included' },
  ], []);

  const filteredServices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const selectedFilter = CATEGORY_FILTERS.find((category) => category.value === selectedCategory) || CATEGORY_FILTERS[0];

    return services.filter((service) => {
      const searchableText = [
        service?.name,
        service?.description,
        service?.category,
        service?.price,
        service?.purpose,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesCategory =
        selectedFilter.value === 'all' ||
        selectedFilter.keywords.some((keyword) => searchableText.includes(keyword));

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, services]);

  const activeCategoryLabel =
    CATEGORY_FILTERS.find((category) => category.value === selectedCategory)?.label || 'all';

  const suggestionList = useMemo(() => {
    if (services && services.length) return services.slice(0, 8).map(s => s.name).filter(Boolean);
    return ['Ganesh Puja', 'Satyanarayan Puja', 'Hawan', 'Mundan', 'Annaprashan', 'Griha Pravesh'];
  }, [services]);

  useEffect(() => {
    if (!suggestionList || suggestionList.length === 0) return;
    const id = setInterval(() => setSuggestionIndex(i => (i + 1) % suggestionList.length), 2600);
    return () => clearInterval(id);
  }, [suggestionList]);

  // Load services on component mount
  useEffect(() => {
    console.log('🔄 Services component mounted');
    loadServices();

    // Listen for booking events from ProtectedBooking
    const handleOpenBooking = (event) => {
      console.log('🎯 Received openBooking event:', event.detail);
      openBooking(event.detail);
    };

    globalThis.addEventListener('openBooking', handleOpenBooking);

    return () => {
      globalThis.removeEventListener('openBooking', handleOpenBooking);
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
          if (globalThis.confirm(t('pendingBookingPrompt'))) {
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

  // Hide the site header while booking modal is open
  useEffect(() => {
    if (selectedServiceForBooking) document.body.classList.add('hide-header');
    else document.body.classList.remove('hide-header');
    return () => document.body.classList.remove('hide-header');
  }, [selectedServiceForBooking]);

  // Close details popup
  const closeDetails = () => {

    setSelectedServiceForDetails(null);
  };

  // Handle successful booking
  const handleBookingSuccess = (booking) => {
    console.log("✅ Booking successful:", booking);
    setSelectedServiceForBooking(null);
  };

  const handleViewPuja = () => {
    pujaCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pujaCardsRef.current?.focus({ preventScroll: true });
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleViewPuja();
    }
  };

  const serviceCount = services.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] via-[#fef6ec] to-[#fffdf9] px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
          <div className="overflow-hidden rounded-[32px] border border-[#ead7bf] bg-[linear-gradient(135deg,rgba(255,252,247,0.98),rgba(249,235,216,0.95))] shadow-[0_18px_60px_rgba(100,38,39,0.08)]">
            <div className="grid gap-0">
              <div className="relative p-5 sm:p-6 lg:p-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#efd8b7] bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-[#8b5e2a] shadow-sm">
                  <Sparkles size={14} />
                  Sacred puja services
                </div>
                <div className="h-8 w-60 max-w-full rounded-full bg-[#f4e6d3]" />
                <div className="mt-3 h-4 w-full max-w-[420px] rounded-full bg-[#f6eadc]" />
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {new Array(4).fill(null).map((_, index) => (
                    <div key={index} className="h-7 w-24 rounded-full bg-white/80" />
                  ))}
                </div>
                <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  {new Array(3).fill(null).map((_, index) => (
                    <div key={index} className="rounded-[18px] border border-[#ecd8bf] bg-white/90 p-3">
                      <div className="h-3.5 w-20 rounded-full bg-[#f0e0c8]" />
                      <div className="mt-2.5 h-5 w-16 rounded-full bg-[#f3e5d0]" />
                    </div>
                  ))}
                </div>
              </div>
              </div>
          </div>

          <Skeleton.FilterBar />
          <Skeleton.ServicesGrid count={6} />
        </div>
      </div>
    );
  }
  // End of loading state

    // Main return with service listings
    // Note: Filter/search bar and category chips removed per user request

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#fef3e8_34%,#fffdf9_100%)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <section
          className="relative overflow-hidden rounded-[34px] border border-[#ead7bf] shadow-[0_18px_60px_rgba(100,38,39,0.08)]"
          style={{
            backgroundImage: "url('/images/heroservices.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-transparent" />
          <div className="relative mx-auto max-w-[1440px] px-5 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
            <div className="max-w-[720px]">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-[#8b5e2a] shadow-sm">
                <Sparkles size={13} />
                Puja services
              </div>

              <h1 className="mt-3 text-[clamp(1.8rem,4vw,3rem)] font-serif font-bold leading-[0.98] text-[#321212]">
                Explore Sacred Puja Services
              </h1>

              <p className="mt-3 max-w-[560px] text-sm sm:text-[15px] text-[#6f4a2a]">
                Book verified Pandits for every occasion.
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {trustPoints.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div key={point.label} className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] sm:text-xs font-medium text-[#5b3a1d] shadow-sm">
                      <Icon size={12} className="text-[#d49a2a]" />
                      <span>{point.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 w-full max-w-[900px]">
                <div className="rounded-full bg-white/95 p-3 shadow-[0_8px_24px_rgba(16,24,40,0.06)] transition-shadow">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-transparent px-4 py-3">
                      <Search size={16} className="shrink-0 text-[#a52240]" />
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={searchQuery.trim() ? 'Search...' : ' Search... ' + (suggestionList[suggestionIndex] || '')}
                        aria-label="Search puja by name"
                        className="min-w-0 w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-[#9b7b62]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleViewPuja}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-maroon1 to-brand-maroon2 px-4 py-2.5 text-sm font-semibold text-white shadow-heavy-maroon transition hover:-translate-y-0.5 disabled:opacity-60"
                      >
                        View Puja
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/find-pandit')}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-maroon1 to-brand-maroon2 px-4 py-2.5 text-sm font-semibold text-white shadow-heavy-maroon transition hover:-translate-y-0.5 disabled:opacity-60"
                      >
                        View Pandit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-[22px] border border-[#f0d59b] bg-[#fff6df] px-5 py-4 text-sm text-[#856404] shadow-sm">
            {error}
          </div>
        )}

        {/* Filter/search bar and category chips removed per user request */}

        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[clamp(1.25rem,1.8vw,1.9rem)] font-semibold text-[#38151c]">Popular Puja Services</h3>
        </div>

        <div ref={pujaCardsRef} tabIndex={-1} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredServices.length === 0 ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-[#e5c8a2] bg-white/80 p-8 text-center shadow-sm sm:p-10">
              <p className="mb-4 text-[#6f4a2a]">
                {searchQuery.trim() ? 'No services match your search.' : t('noServicesAvailable')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d9b78c] bg-white px-4 py-2.5 text-sm font-semibold text-[#642627] transition hover:bg-[#fff5ea]"
                  >
                    Clear search
                  </button>
                )}
                <button onClick={loadServices} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-maroon1 to-brand-maroon2 px-4 py-2.5 text-sm font-semibold text-white shadow-heavy-maroon transition hover:-translate-y-0.5">
                  {t('tryAgain')}
                </button>
              </div>
            </div>
          ) : (
            filteredServices.map((service, index) => (
              <ServiceCard
                key={service._id || service.id}
                service={service}
                index={index}
                onBookClick={openBooking}
                onDetailsClick={openDetails}
                detailsLabel={t('viewDetails')}
              />
            ))
          )}
        </div>

        <div className="rounded-[28px] border border-[#ead7bf] bg-[#fffaf4] p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Verified Pandits', 'Background checked & experienced'],
              ['Secure Payments', '100% safe & secure transactions'],
              ['Easy Cancellation', 'Hassle-free cancellation & refunds'],
              ['24/7 Support', 'We’re here to help you anytime'],
              ['Puja Samagri', 'High-quality samagri included'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[22px] border border-[#f0e0c4] bg-white p-4">
                <p className="text-sm font-semibold text-[#642627]">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[#7b5c3a]">{description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Booking Form Modal */}
      {selectedServiceForBooking && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeBooking}>
          <div className="relative w-full max-w-xl overflow-auto p-0" onClick={e => e.stopPropagation()}>
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
        <Popup
          service={selectedServiceForDetails}
          onClose={closeDetails}
          onBookNow={(service) => {
            closeDetails();
            openBooking(service);
          }}
        />
      )}
    </div>
  );
};

export default Services;