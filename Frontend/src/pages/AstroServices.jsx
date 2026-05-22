import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SERVICE_FILTERS = [
    { key: 'all', label: 'All Services' },
    { key: 'kundali', label: 'Kundali' },
    { key: 'horoscope', label: 'Horoscope' },
    { key: 'compatibility', label: 'Compatibility' },
    { key: 'free', label: 'Free' },
    { key: 'premium', label: 'Premium' },
];

const ASTRO_SERVICES = [
    {
        id: 'basic-birth-chart',
        category: 'kundali',
        tier: 'free',
        badge: 'FREE',
        title: 'Basic Birth Chart Reading',
        shortDesc: 'Get a glimpse of your cosmic blueprint.',
        description: 'A simple introduction to your celestial chart with clear, beginner-friendly guidance.',
        features: ['Planetary positions', 'Rashi & Lagna details', 'Basic life analysis'],
        price: 'Completely Free',
        cta: 'Get Started',
        actionRoute: '/astro/kundali',
        requiresAuth: false,
        accent: 'from-lime-100 via-emerald-100 to-green-100',
        iconBg: 'bg-lime-100 text-lime-700',
        icon: '🌿',
    },
    {
        id: 'detailed-kundali',
        category: 'kundali',
        tier: 'premium',
        badge: 'MOST POPULAR',
        title: 'Detailed Kundali Analysis',
        shortDesc: 'Comprehensive analysis of your birth chart.',
        description: 'A deeper reading covering planetary patterns, doshas, yogas, and life-path insights.',
        features: ['Detailed planet analysis', 'Dosha & Bhukti calculations', 'Yogas & combinations'],
        price: '₹499',
        cta: 'Explore',
        actionRoute: '/astro/kundali',
        requiresAuth: true,
        accent: 'from-amber-100 via-orange-100 to-amber-200',
        iconBg: 'bg-orange-100 text-orange-700',
        icon: '🕉',
    },
    {
        id: 'daily-horoscope',
        category: 'horoscope',
        tier: 'free',
        badge: 'FREE',
        title: 'Daily Horoscope',
        shortDesc: 'Personalized daily guidance from the stars.',
        description: 'A clear daily reading with lucky cues, advice, and practical astrological direction.',
        features: ['Daily predictions', 'Lucky color & number', 'Do’s & Don’ts'],
        price: 'Completely Free',
        cta: 'Get Started',
        actionRoute: '/astro/horoscope',
        requiresAuth: false,
        accent: 'from-violet-100 via-fuchsia-100 to-purple-100',
        iconBg: 'bg-violet-100 text-violet-700',
        icon: '🌙',
    },
    {
        id: 'weekly-horoscope',
        category: 'horoscope',
        tier: 'free',
        badge: 'FREE',
        title: 'Weekly Horoscope',
        shortDesc: 'Plan your week with cosmic guidance.',
        description: 'A weekly forecast focused on work, emotions, health, and timing.',
        features: ['Weekly predictions', 'Career & finance', 'Health & relationships'],
        price: 'Completely Free',
        cta: 'Get Started',
        actionRoute: '/astro/horoscope',
        requiresAuth: false,
        accent: 'from-amber-100 via-yellow-100 to-orange-100',
        iconBg: 'bg-amber-100 text-amber-700',
        icon: '📅',
    },
    {
        id: 'compatibility-analysis',
        category: 'compatibility',
        tier: 'premium',
        badge: 'PREMIUM',
        title: 'Compatibility Analysis',
        shortDesc: 'Detailed compatibility for relationships.',
        description: 'A relationship reading with guna matching, strengths, and practical suggestions.',
        features: ['Guna Milan', 'Love & marriage analysis', 'Remedies & suggestions'],
        price: '₹499',
        cta: 'Explore',
        actionRoute: '/astro/compatibility',
        requiresAuth: true,
        accent: 'from-rose-100 via-pink-100 to-red-100',
        iconBg: 'bg-rose-100 text-rose-700',
        icon: '👥',
    },
    {
        id: 'yearly-prediction',
        category: 'compatibility',
        tier: 'premium',
        badge: 'PREMIUM',
        title: 'Yearly Prediction Report',
        shortDesc: 'Upcoming year insights & predictions.',
        description: 'A year-ahead forecast for career, health, finance, travel, and key milestones.',
        features: ['Yearly forecast', 'Career & finance outlook', 'Health & wellbeing'],
        price: '₹799',
        cta: 'Explore',
        actionRoute: '/astro/horoscope',
        requiresAuth: true,
        accent: 'from-sky-100 via-cyan-100 to-blue-100',
        iconBg: 'bg-sky-100 text-sky-700',
        icon: '🪐',
    },
];

const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const AstroHeroArt = () => (
    <div className="relative mx-auto w-full max-w-[430px] aspect-square">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.96)_0%,rgba(255,238,198,0.96)_28%,rgba(244,178,74,0.92)_53%,rgba(145,63,10,0.96)_100%)] shadow-[0_30px_80px_rgba(162,84,18,0.32)]" />
        <div className="absolute inset-4 rounded-full border border-white/40" />
        <div className="absolute inset-10 rounded-full border border-amber-200/70 shadow-inner" />
        <div className="absolute inset-16 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,240,198,0.35),rgba(133,54,7,0.18))]" />

        <div className="absolute inset-8 rounded-full border border-white/25 bg-[conic-gradient(from_10deg,rgba(255,242,201,0.2),rgba(255,198,93,0.18),rgba(255,242,201,0.18),rgba(171,79,12,0.12))]" />

        {zodiacSymbols.map((symbol, index) => {
            const angle = (360 / zodiacSymbols.length) * index;
            return (
                <div
                    key={symbol + index}
                    className="absolute left-1/2 top-1/2 text-[18px] font-semibold text-amber-100/95 drop-shadow-sm"
                    style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-155px) rotate(-${angle}deg)` }}
                >
                    {symbol}
                </div>
            );
        })}

        <div className="absolute left-1/2 top-[48%] h-[210px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-[26px] border border-[#c57a2f]/40 bg-gradient-to-b from-[#fff4d7] via-[#f6d48a] to-[#d67b1f] shadow-[0_20px_50px_rgba(128,59,8,0.25)]">
            <div className="absolute inset-4 rounded-[18px] border border-[#be6f20]/55 bg-[linear-gradient(90deg,transparent_49%,rgba(160,68,10,0.35)_50%,transparent_51%),linear-gradient(transparent_49%,rgba(160,68,10,0.35)_50%,transparent_51%)] bg-[length:26px_26px]" />
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#9a4810]/50 bg-[#f7b850]/70 shadow-[0_0_20px_rgba(255,179,66,0.55)]" />
        </div>

        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-end gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-300/80 blur-[1px]" />
            <div className="h-10 w-10 rounded-full bg-orange-400/85 blur-[1px]" />
            <div className="h-7 w-7 rounded-full bg-orange-300/80 blur-[1px]" />
        </div>

        <div className="absolute bottom-6 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-[#84511f] shadow-[0_0_25px_rgba(255,180,72,0.55)]">
            <div className="absolute left-1/2 top-0 h-7 w-4 -translate-x-1/2 rounded-full bg-gradient-to-t from-amber-300 to-yellow-50 shadow-[0_0_18px_rgba(255,192,76,0.8)]" />
        </div>
    </div>
);

const ServiceCard = ({ service, onAction }) => {
    return (
        <article className="group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_14px_40px_rgba(140,77,21,0.09)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(140,77,21,0.16)]">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${service.accent}`} />
            <div className="flex items-start justify-between gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${service.iconBg} text-3xl shadow-sm`}>
                    {service.icon}
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.22em] ${service.tier === 'free' ? 'bg-lime-100 text-lime-700' : 'bg-amber-100 text-amber-700'}`}>
                    {service.badge}
                </span>
            </div>

            <div className="mt-4">
                <h3 className="text-[21px] font-semibold leading-tight text-[#5f2d18]">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#80624f]">{service.shortDesc}</p>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-[#7a5c4a]">
                {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                        <span className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${service.tier === 'free' ? 'bg-lime-500' : 'bg-orange-500'}`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-[#e8d8c5] pt-4">
                <div>
                    <div className="text-sm font-semibold text-[#4c8a3d]">{service.price}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#9a7a62]">{service.tier === 'free' ? 'Free Service' : 'Premium Service'}</div>
                </div>

                <button
                    type="button"
                    onClick={() => onAction(service)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(133,63,10,0.2)] transition hover:translate-x-0.5 ${service.tier === 'free' ? 'bg-gradient-to-r from-[#d96b12] to-[#f08d1a]' : 'bg-gradient-to-r from-[#a7112a] to-[#8a0f23]'}`}
                >
                    {service.cta}
                    <span>→</span>
                </button>
            </div>
        </article>
    );
};

const AstroServices = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [serviceType, setServiceType] = useState('free');
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        const timer = window.setTimeout(() => setIsVisible(true), 40);
        return () => window.clearTimeout(timer);
    }, []);

    const filteredServices = useMemo(() => {
        return ASTRO_SERVICES.filter((service) => {
            const matchesType = serviceType === 'all' || service.tier === serviceType;
            const matchesFilter = selectedFilter === 'all' || service.category === selectedFilter || service.tier === selectedFilter;
            return matchesType && matchesFilter;
        });
    }, [selectedFilter, serviceType]);

    const handleAction = (service) => {
        if (service.requiresAuth && !isAuthenticated) {
            localStorage.setItem('redirectAfterLogin', '/astro-services');
            localStorage.setItem('pendingAstroAction', JSON.stringify({ route: service.actionRoute, title: service.title }));
            alert('Please login to use this premium service.');
            navigate('/user/login');
            return;
        }

        navigate(service.actionRoute);
    };

    const applyHeroFilter = (value) => {
        setServiceType(value);
        setSelectedFilter(value);
        document.getElementById('astro-services-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className={`min-h-screen overflow-hidden bg-[#fbf0e0] text-[#5b2614] ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,205,145,0.22),transparent_22%)]" />
            <div className="absolute inset-0 opacity-[0.18] bg-[linear-gradient(90deg,rgba(145,72,20,0.03)_1px,transparent_1px),linear-gradient(rgba(145,72,20,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <main className="relative mx-auto max-w-[1240px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <section className="rounded-[34px] border border-white/80 bg-gradient-to-br from-[#fff6ea] via-[#fdf2de] to-[#fde7c7] px-5 py-6 shadow-[0_24px_60px_rgba(138,70,20,0.12)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                    <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.95fr] lg:gap-8">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8b24f]/35 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c96f16] shadow-sm">
                                <span>DIVINE GUIDANCE</span>
                                <span className="text-[#e0a128]">•</span>
                                <span>Sacred Wisdom</span>
                            </div>

                            <h1 className="mt-5 text-[44px] font-semibold leading-[0.98] tracking-[-0.03em] text-[#6a2f16] sm:text-[62px] lg:text-[70px]">
                                <span className="block">Celestial Astrology</span>
                                <span className="block text-[#d86417]">Services</span>
                            </h1>

                            <p className="mt-5 max-w-xl text-[17px] leading-8 text-[#7d5b45] sm:text-[18px]">
                                Illuminate your life path through the sacred science of Jyotish — the eye of the Vedas.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => applyHeroFilter('free')}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#edd7bf] bg-white px-5 py-3 text-sm font-semibold text-[#90542a] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fff8ef]"
                                >
                                    <span>🪷</span>
                                    Free Services
                                </button>

                                <button
                                    type="button"
                                    onClick={() => applyHeroFilter('premium')}
                                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#efbf58] to-[#e1a63f] px-5 py-3 text-sm font-semibold text-[#6b2d10] shadow-[0_10px_24px_rgba(214,146,43,0.28)] transition hover:-translate-y-0.5"
                                >
                                    <span>✦</span>
                                    Premium Consultation
                                </button>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[#8b6a52]">
                                <div className="flex items-center gap-2"><span className="text-[#e09d3e]">👣</span><span>25+ Years of Tradition</span></div>
                                <div className="flex items-center gap-2"><span className="text-[#e09d3e]">☸</span><span>Vedic Lineage</span></div>
                                <div className="flex items-center gap-2"><span className="text-[#e09d3e]">🪔</span><span>20,000+ Kundlis Studied</span></div>
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center lg:justify-end">
                            <AstroHeroArt />
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-[28px] border border-white/75 bg-white/90 px-4 py-4 shadow-[0_14px_30px_rgba(138,70,20,0.08)] sm:px-6">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {SERVICE_FILTERS.map((filter) => {
                            const active = selectedFilter === filter.key || serviceType === filter.key;
                            return (
                                <button
                                    key={filter.key}
                                    type="button"
                                    onClick={() => {
                                        setSelectedFilter(filter.key);
                                        if (filter.key === 'free' || filter.key === 'premium') {
                                            setServiceType(filter.key);
                                        } else if (selectedFilter === 'free' || selectedFilter === 'premium') {
                                            setServiceType('all');
                                        }
                                    }}
                                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${active ? 'border-[#e3a94c] bg-[#fff5e2] text-[#a35c16] shadow-sm' : 'border-[#f0e2d2] bg-white text-[#7e6654] hover:bg-[#fffaf2]'}`}
                                >
                                    {filter.key === 'all' && <span>▣</span>}
                                    {filter.key === 'kundali' && <span>🪔</span>}
                                    {filter.key === 'horoscope' && <span>☾</span>}
                                    {filter.key === 'compatibility' && <span>👥</span>}
                                    {filter.key === 'free' && <span>🎁</span>}
                                    {filter.key === 'premium' && <span>👑</span>}
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section id="astro-services-grid" className="pt-14">
                    <div className="text-center">
                        <h2 className="text-[31px] font-semibold tracking-[-0.02em] text-[#5c2c18] sm:text-[38px]">Explore Our Astrology Services</h2>
                        <div className="mx-auto mt-3 h-[1px] w-20 bg-gradient-to-r from-transparent via-[#c99c60] to-transparent" />
                        <p className="mt-4 text-[16px] text-[#8b6a52]">Choose a service to begin your journey of self-discovery and guidance.</p>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredServices.map((service) => (
                            <ServiceCard key={service.id} service={service} onAction={handleAction} />
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div className="mt-10 rounded-[24px] border border-dashed border-[#e3c8a8] bg-white/85 p-8 text-center text-[#8b6a52]">
                            No services match this filter.
                        </div>
                    )}
                </section>

                <section className="relative mt-12 overflow-hidden rounded-[34px] border border-[#ebd2b2] bg-gradient-to-br from-[#fffaf4] via-[#fff5e8] to-[#fff0df] p-6 shadow-[0_20px_50px_rgba(138,70,20,0.10)] sm:p-8">

                    {/* Decorative glow */}
                    <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f5c77d]/20 blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[#d78c38]/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                        {/* Left Content */}
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                            {/* Premium Icon */}
                            <div className="relative shrink-0">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#f9d18b] via-[#d88a2b] to-[#9e4d14] shadow-[0_16px_32px_rgba(215,124,30,0.30)] ring-[8px] ring-[#fff6ea]">
                                    <span className="text-[40px]">🔮</span>
                                </div>

                                <div className="absolute -bottom-1 right-0 rounded-full bg-[#8f1426] px-2 py-1 text-[10px] font-semibold text-white shadow-md">
                                    PREMIUM
                                </div>
                            </div>

                            {/* Text */}
                            <div>
                                <span className="mb-2 inline-flex items-center rounded-full border border-[#efc898] bg-[#fff5e6] px-3 py-1 text-xs font-semibold text-[#bc6a16]">
                                    ✦ Personal Astrology Guidance
                                </span>

                                <h3 className="text-[30px] font-bold leading-tight text-[#652e17]">
                                    Ready for Deeper Insights?
                                </h3>

                                <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#7f634f]">
                                    Unlock detailed Vedic consultation, personalized remedies,
                                    compatibility analysis, and expert astrological guidance tailored to
                                    your spiritual journey.
                                </p>

                                {/* Benefits */}
                                <div className="mt-5 flex flex-wrap gap-3">

                                    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#754f35] shadow-sm">
                                        <span className="text-[#d17b1f]">◎</span>
                                        One-on-One Session
                                    </div>

                                    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#754f35] shadow-sm">
                                        <span className="text-[#d17b1f]">◎</span>
                                        100% Confidential
                                    </div>

                                    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#754f35] shadow-sm">
                                        <span className="text-[#d17b1f]">◎</span>
                                        Verified Astrologers
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Right CTA */}
                        <div className="flex flex-col items-start gap-4 lg:items-end">

                            <button
                                type="button"
                                onClick={() => applyHeroFilter('premium')}
                                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#a70f2a] via-[#8d1026] to-[#70101f] px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(126,16,34,0.32)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(126,16,34,0.40)]"
                            >
                                <span className="relative z-10">
                                    Explore Premium Services
                                </span>

                                <span className="transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>

                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </button>

                            {/* Trust Badge */}
                            <div className="rounded-2xl border border-[#efd8b8] bg-white/80 px-5 py-3 backdrop-blur-sm">
                                <p className="text-sm font-medium text-[#65321c]">
                                    Trusted by 10,000+ Devotees
                                </p>

                                <div className="mt-2 flex items-center gap-2 text-xs text-[#8d6b52]">
                                    ⭐ 4.9 Rating
                                    <span className="h-1 w-1 rounded-full bg-[#d4b18b]" />
                                    Expert Guidance
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AstroServices;