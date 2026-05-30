// Frontend/src/BookPandit/FindPandit.jsx

import React, { useState, useEffect } from "react";
import { panditApi } from "../api/panditApi";
import { analytics } from '../utils/analytics';
import BookingForm from '../components/common/BookingForm';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Skeleton from '../components/common/Skeleton';
import '../styles/FindPandit.css';

export default function FindPandit() {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pandits, setPandits] = useState([]);
    const [locations, setLocations] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPandit, setSelectedPandit] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        loadFilterOptions();
        loadPandits();
    }, []);

    useEffect(() => {
        loadPandits();
    }, [search, locationFilter, serviceFilter, page]);

    const openBooking = (pandit) => {
        setSelectedPandit(pandit);
        setShowBookingModal(true);
    };

    const closeBooking = () => {
        setShowBookingModal(false);
        setSelectedPandit(null);
    };

    // Hide the site header while booking modal is open
    useEffect(() => {
        if (showBookingModal) document.body.classList.add('hide-header');
        else document.body.classList.remove('hide-header');
        return () => document.body.classList.remove('hide-header');
    }, [showBookingModal]);

    const loadFilterOptions = async () => {
        try {

            const data = await panditApi.getFilterOptions();

            setLocations(data.locations || []);
            setServices(data.services || []);
        } catch (err) {
            console.error('Failed to load filter options:', err);
            setError(err?.response?.data?.message || err?.message || t('noPanditsFound'));
        }
    };

    const loadPandits = async () => {
        analytics.trackSearch(search, {
            location: locationFilter,
            service: serviceFilter,
            page: page
        });
        setLoading(true);
        setError("");

        try {

            const filters = {
                search: search,
                location: locationFilter,
                service: serviceFilter,
                page: page,
                limit: 6 // Reduced for better testing
            };

            const data = await panditApi.getAllPandits(filters);

            setPandits(data.pandits || []);
            setTotalPages(data.totalPages || 1);



        } catch (err) {
            console.error('Failed to load pandits:', err);
            setError(err?.response?.data?.message || err?.message || t('noPanditsFound'));

            // Fallback to mock data
            setPandits(getMockPandits());
        } finally {
            setLoading(false);
        }
    };

    // Enhanced mock data with more items
    const getMockPandits = () => [
        {
            _id: "1",
            name: "Soham Utpat",
            location: "Pune",
            services: ["Vaastu Shanti", "Pooja"],
            contact: "8767119282",
            email: "soham.utpat.sit.comp@gmail.com",
            rating: 4.2,
            image: "/images/icon.png",
            experience: 5
        },
        {
            _id: "2",
            name: "Atharv Kulkarni",
            location: "Pune",
            services: ["Ganesh Puja"],
            contact: "9876543210",
            email: "atharv@example.com",
            rating: 4.5,
            image: "/images/icon.png",
            experience: 8
        },
        {
            _id: "3",
            name: "Rajesh Sharma",
            location: "Mumbai",
            services: ["Bhumi Pujan", "Griha Pravesh"],
            contact: "9123456789",
            email: "rajesh@example.com",
            rating: 4.7,
            image: "/images/icon.png",
            experience: 12
        },
        {
            _id: "4",
            name: "Priya Deshpande",
            location: "Delhi",
            services: ["Mangalagaur Puja", "Naming Ceremony"],
            contact: "8987654321",
            email: "priya@example.com",
            rating: 4.8,
            image: "/images/icon.png",
            experience: 10
        },
        {
            _id: "5",
            name: "Anil Kumar",
            location: "Bangalore",
            services: ["Lakshmi Puja", "Satya Narayan Puja"],
            contact: "7890123456",
            email: "anil@example.com",
            rating: 4.3,
            image: "/images/icon.png",
            experience: 7
        },
        {
            _id: "6",
            name: "Sunil Patel",
            location: "Ahmedabad",
            services: ["Rudrabhishek", "Laghu Rudra Puja"],
            contact: "8901234567",
            email: "sunil@example.com",
            rating: 4.6,
            image: "/images/icon.png",
            experience: 15
        }
    ];

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };
    const maskContact = (number) => {
        if (!number) return "**********";
        return number.replace(/.(?=.{4})/g, "*");
    };
    const userIsLoggedIn =
        !!localStorage.getItem("adminToken") ||
        !!localStorage.getItem("panditToken");

        if (loading) {
        return (
                <div className="find-pandit-page">
                    <div className="find-pandit-shell">
                        <section className="find-pandit-hero">
                            <div className="find-pandit-hero-kicker">PanditJi Network</div>
                            <h1 className="find-pandit-title">{t('findPanditTitle')}</h1>
                            <p className="find-pandit-subtitle">Choose a verified pandit, compare services, and book with confidence.</p>
                        </section>
                        <Skeleton.FilterBar />
                        <Skeleton.PanditsGrid count={6} />
                        <Skeleton.Pagination />
                    </div>
            </div>
        );
    }

    return (
            <div className="find-pandit-page">
                <div className="find-pandit-shell">
                    <section className="find-pandit-hero">
                        <div className="find-pandit-hero-kicker">PanditJi Network</div>
                        <h1 className="find-pandit-title">{t('findPanditTitle')}</h1>
                        <p className="find-pandit-subtitle">Browse trusted pandits, filter by city or service, and start your booking from one place.</p>
                    </section>

                    <section className="find-pandit-filters-card">
                        <div className="find-pandit-filters-header">
                            <span className="find-pandit-filters-label">Search & Filters</span>
                            <span className="find-pandit-filters-note">Refine the list to match your event</span>
                        </div>

                        <div className="find-pandit-filters-grid">
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                            className="find-pandit-input"
                    />
                        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="find-pandit-select">
                        <option value="">{t('allLocations')}</option>
                        {locations.map((loc, idx) => (
                            <option key={idx} value={loc}>{loc}</option>
                        ))}
                    </select>
                        <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="find-pandit-select">
                        <option value="">{t('allServices')}</option>
                        {services.map((srv, idx) => (
                            <option key={idx} value={srv}>{srv}</option>
                        ))}
                    </select>
                        </div>
                    </section>

            {loading && <LoadingSpinner text={t('loadingPandits')} />}
                {error && <div className="find-pandit-error">{error}</div>}

            {/* Pandit Cards */}
                <div className="find-pandit-grid">
                {pandits.map(pandit => (
                        <div key={pandit._id || pandit.id} className="find-pandit-card">
                            <div className="find-pandit-avatar-wrap">
                                <img src={pandit.image} alt={pandit.name}
                            onError={(e) => { e.target.src = '/images/icon.png'; }}
                                className="find-pandit-avatar" />
                            </div>
                            <div className="find-pandit-card-body">
                                <h3 className="find-pandit-card-title">{pandit.name}</h3>
                                <p className="find-pandit-card-services">{Array.isArray(pandit.services) ? pandit.services.join(", ") : pandit.services}</p>
                                <div className="find-pandit-meta">
                                    <p><strong>{t('locationLabel')}:</strong> {pandit.location}</p>
                                    <p><strong>{t('ratingLabel')}:</strong> {pandit.rating} ⭐</p>
                                    <p><strong>{t('experienceLabel')}:</strong> {pandit.experience || 'N/A'} years</p>
                                    <p><strong>{t('contactLabel')}:</strong> {userIsLoggedIn ? pandit.contact : maskContact(pandit.contact)}</p>
                                </div>

                            <div className="find-pandit-card-actions">
                          <button
                            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:shadow-md transition"
                            onClick={() => openBooking(pandit)}
                          >
                            {t('bookPanditNow')}
                          </button>
                        </div>
                            </div>
                    </div>
                ))}
            </div>

            {!loading && pandits.length === 0 && (
                    <div className="find-pandit-empty">
                        <h3>{t('noPanditsFound')}</h3>
                        <p>{t('adjustFilters')}</p>
                        <small>{t('currentFilters')}
                        {search && ` Search: "${search}"`}
                        {locationFilter && ` Location: "${locationFilter}"`}
                        {serviceFilter && ` Service: "${serviceFilter}"`}
                        {!search && !locationFilter && !serviceFilter && ' No filters applied'}
                    </small>
                </div>
            )}

            {/* Enhanced Pagination */}
            {pandits.length > 0 && (
                    <div className="find-pandit-pagination">
                    <button onClick={handlePrevPage} disabled={page === 1 || loading} className="px-4 py-2 rounded-lg border bg-white">
                        ← Previous
                    </button>

                        <span className="find-pandit-pageinfo">Page {page} of {totalPages} {totalPages > 1 && `(${pandits.length} items)`}</span>

                    <button onClick={handleNextPage} disabled={page >= totalPages || loading} className="px-4 py-2 rounded-lg border bg-white">
                        Next →
                    </button>
                </div>
            )}
            {showBookingModal && selectedPandit && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeBooking}>
                                        <div className="w-full max-w-2xl p-0" onClick={e => e.stopPropagation()}>
                                                <BookingForm
                            service={null}
                            pandit={selectedPandit}
                            onClose={closeBooking}
                            onSuccess={() => {
                                closeBooking();
                                alert('Booking request sent to pandit!');
                            }}
                        />
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}