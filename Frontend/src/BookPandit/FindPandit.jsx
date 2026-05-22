// Frontend/src/BookPandit/FindPandit.jsx

import React, { useState, useEffect } from "react";
import { panditApi } from "../api/panditApi";
import { analytics } from '../utils/analytics';
import BookingForm from '../components/common/BookingForm';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Skeleton from '../components/common/Skeleton';

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

    const loadFilterOptions = async () => {
        try {

            const data = await panditApi.getFilterOptions();

            setLocations(data.locations || []);
            setServices(data.services || []);
        } catch (err) {

            setError(t('noPanditsFound'));
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

            setError(t('noPanditsFound'));

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
            <div className="px-4 py-8 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">{t('findPanditTitle')}</h1>
                <Skeleton.FilterBar />
                <Skeleton.PanditsGrid count={6} />
                <Skeleton.Pagination />
            </div>
        );
    }

    return (
        <div className="px-4 py-8 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">{t('findPanditTitle')}</h1>

                {/* Search and Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                    <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="px-3 py-2 rounded-lg border bg-white text-sm">
                        <option value="">{t('allLocations')}</option>
                        {locations.map((loc, idx) => (
                            <option key={idx} value={loc}>{loc}</option>
                        ))}
                    </select>
                    <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="px-3 py-2 rounded-lg border bg-white text-sm">
                        <option value="">{t('allServices')}</option>
                        {services.map((srv, idx) => (
                            <option key={idx} value={srv}>{srv}</option>
                        ))}
                    </select>
                </div>

            {loading && <LoadingSpinner text={t('loadingPandits')} />}
            {error && <div className="error">{error}</div>}

            {/* Pandit Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pandits.map(pandit => (
                    <div key={pandit._id || pandit.id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col h-full">
                        <img src={pandit.image} alt={pandit.name}
                            onError={(e) => { e.target.src = '/images/icon.png'; }}
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-white shadow-sm" />
                        <h3 className="text-lg font-semibold text-center mb-1">{pandit.name}</h3>
                        <p className="text-sm text-amber-600 text-center mb-2">{Array.isArray(pandit.services) ? pandit.services.join(", ") : pandit.services}</p>
                        <p className="text-sm text-gray-600"><strong>{t('locationLabel')}:</strong> {pandit.location}</p>
                        <p className="text-sm text-gray-600"><strong>{t('ratingLabel')}:</strong> {pandit.rating} ⭐</p>
                        <p className="text-sm text-gray-600"><strong>{t('experienceLabel')}:</strong> {pandit.experience || 'N/A'} years</p>
                        <p className="text-sm text-gray-600 mt-2"><strong>{t('contactLabel')}:</strong> {userIsLoggedIn ? pandit.contact : maskContact(pandit.contact)}</p>

                        <div className="mt-auto pt-4">
                          <button
                            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:shadow-md transition"
                            onClick={() => openBooking(pandit)}
                          >
                            {t('bookPanditNow')}
                          </button>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && pandits.length === 0 && (
                <div className="text-center p-12 bg-white rounded-2xl shadow-sm">
                    <h3 className="text-xl font-semibold">{t('noPanditsFound')}</h3>
                    <p className="text-gray-600 mt-2">{t('adjustFilters')}</p>
                    <small className="text-sm text-gray-500 mt-2 block">{t('currentFilters')}
                        {search && ` Search: "${search}"`}
                        {locationFilter && ` Location: "${locationFilter}"`}
                        {serviceFilter && ` Service: "${serviceFilter}"`}
                        {!search && !locationFilter && !serviceFilter && ' No filters applied'}
                    </small>
                </div>
            )}

            {/* Enhanced Pagination */}
            {pandits.length > 0 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button onClick={handlePrevPage} disabled={page === 1 || loading} className="px-4 py-2 rounded-lg border bg-white">
                        ← Previous
                    </button>

                    <span className="text-sm text-gray-600">Page {page} of {totalPages} {totalPages > 1 && `(${pandits.length} items)`}</span>

                    <button onClick={handleNextPage} disabled={page >= totalPages || loading} className="px-4 py-2 rounded-lg border bg-white">
                        Next →
                    </button>
                </div>
            )}
            {showBookingModal && selectedPandit && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={closeBooking}>
                    <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end">
                          <button className="text-gray-500 hover:text-gray-800" onClick={closeBooking}>✖</button>
                        </div>
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
    );
}