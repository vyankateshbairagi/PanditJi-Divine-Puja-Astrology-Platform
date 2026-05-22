import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { languageDisplayNames } from '../../i18n/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBook,
  faCalendar,
  faChevronDown,
  faGift,
  faGlobe,
  faGear,
  faHome,
  faMobileScreenButton,
  faStar,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  
  
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const userMenuRef = useRef(null);
  const languageRef = useRef(null);
  const navigate = useNavigate();
  
  const { user, logout, isAuthenticated } = useAuth();
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const languages = ['English', 'Hindi', 'Marathi'];
  

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setIsMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
    setLanguageOpen(false);
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setLanguageOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };

  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate('/services');
    } else {
      navigate('/user/login');
    }
  };

  const navItems = [
    { labelKey: 'home', to: '/', icon: faHome, pill: true },
    { labelKey: 'services', to: '/services', dropdown: true },
    { labelKey: 'findPandit', to: '/find-pandit' },
    { labelKey: 'astroServices', to: '/astro-services', dropdown: true },
    { labelKey: 'aboutUs', to: '/about' },
    { labelKey: 'contactUs', to: '/contact' },
    
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target) &&
          userMenuRef.current && !userMenuRef.current.contains(event.target) &&
          languageRef.current && !languageRef.current.contains(event.target)) {
        closeMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Close menu when clicking on nav links
    const handleNavLinkClick = () => {
      closeMenus();
    };

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', handleNavLinkClick);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      navLinks.forEach(link => {
        link.removeEventListener('click', handleNavLinkClick);
      });
    };
  }, []);

  // Close menu when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMenus();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);

  // Prevent background scroll when mobile nav is open and close on Escape
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    const handleKey = (e) => {
      if (e.key === 'Escape') closeMenus();
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [isMenuOpen]);

  return (
  <header className="sticky top-0 z-50 w-full bg-[linear-gradient(#fffaf6,#fff6f0)]">
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-5 lg:px-6">
      <div className="hidden h-8 items-center justify-between border-b border-amber-100 text-[12px] font-semibold text-stone-500 lg:flex bg-transparent">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2">{t('omNamahShivaya')}</span>
          <span className="text-amber-200">/</span>
          <span className="inline-flex items-center gap-2">{t('trustedBy')}</span>
          <span className="text-amber-200">/</span>
          <span className="inline-flex items-center gap-2 text-stone-700">
            <FontAwesomeIcon icon={faStar} className="text-amber-500" />
            {t('rating')}
            <span className="tracking-[1px] text-amber-500">★★★★★</span>
            <span>{t('reviews')}</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-stone-500 transition hover:text-stone-800"
            onClick={() => navigate('/download-app')}
          >
            <FontAwesomeIcon icon={faMobileScreenButton} /> {t('downloadApp')}
          </button>
          <button type="button" className="inline-flex items-center gap-2 text-[11px] font-semibold text-stone-500 transition hover:text-stone-800">
            <FontAwesomeIcon icon={faGift} /> {t('offers')}
          </button>

          <div className="relative" ref={languageRef}>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-stone-800"
              onClick={() => setLanguageOpen(!languageOpen)}
            >
              <FontAwesomeIcon icon={faGlobe} />
              <span>{currentLanguage}</span>
              <span className="hidden sm:inline">{languageDisplayNames[currentLanguage]?.script}</span>
              <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
            </button>

            {languageOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-36 overflow-hidden rounded-2xl border border-amber-100 bg-white p-1 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition hover:bg-amber-50 ${currentLanguage === lang ? 'bg-amber-50 text-amber-800' : 'text-stone-700'}`}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    <span>{lang}</span>
                    <span className="text-xs text-stone-500">{languageDisplayNames[lang]?.script}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="relative flex items-center justify-between gap-3 py-2.5 lg:min-h-[68px]">
        <button
          ref={buttonRef}
          className={`flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-full border border-amber-200 bg-white text-stone-700 transition hover:border-amber-300 hover:bg-amber-50 lg:hidden ${isMenuOpen ? 'ring-2 ring-amber-300' : ''}`}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          aria-label="Toggle menu"
        >
          <span className="h-0.5 w-4.5 rounded-full bg-current" />
          <span className="h-0.5 w-4.5 rounded-full bg-current" />
          <span className="h-0.5 w-4.5 rounded-full bg-current" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 text-left no-underline" onClick={closeMenus}>
          <img src="/icon.png" alt="PanditJi Logo" className="h-12 w-12 object-contain sm:h-13 sm:w-13 lg:h-14 lg:w-14" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[24px] font-extrabold tracking-[-0.5px] text-[#8a2b2b] sm:text-[26px] lg:text-[28px]">{t('panditJi')}</span>
            <span className="mt-0.5 text-[10px] font-medium text-stone-500 sm:text-[11px]">{t('tagline')}</span>
          </span>
        </Link>

        <div
          id="main-navigation"
          ref={menuRef}
          className={`${isMenuOpen ? 'absolute block' : 'absolute hidden'} left-0 right-0 top-full z-50 mt-2 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-amber-100 bg-white px-4 py-4 shadow-[0_16px_30px_rgba(0,0,0,0.12)] lg:static lg:mt-0 lg:block lg:max-h-none lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none`}
        >
          <ul className="m-0 flex list-none flex-col items-stretch gap-2 p-0 lg:flex-row lg:items-center lg:justify-center lg:gap-3.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `nav-link group flex w-full items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition lg:w-auto lg:px-2.5 lg:py-1.5 lg:text-[13px] ${item.pill ? 'bg-[#fff2e8] border border-amber-100 text-[#7a2b2b] shadow-sm' : ''} ${isActive ? 'bg-amber-50 text-amber-800' : 'text-stone-700 hover:bg-amber-50 hover:text-amber-800'}`}
                  onClick={closeMenus}
                >
                  {item.icon ? <FontAwesomeIcon icon={item.icon} className="text-[11px] text-amber-700 lg:text-sm" /> : null}
                  <span>{t(item.labelKey)}</span>
                  {item.dropdown ? <FontAwesomeIcon icon={faChevronDown} className="text-[9px] text-stone-400" /> : null}
                </NavLink>
              </li>
            ))}
          </ul>

          {isAuthenticated ? (
            <div className="mt-4 flex flex-col gap-2.5 rounded-2xl border border-amber-100 bg-amber-50/70 p-3.5 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-950">{user?.name?.charAt(0) || 'U'}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-800">{user?.name || 'User'}</p>
                  <p className="truncate text-xs text-stone-500">{user?.email}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Link to="/user/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[13px] font-medium text-stone-700 transition hover:bg-white" onClick={closeMenus}>
                  <FontAwesomeIcon icon={faBook} /> {t('dashboard')}
                </Link>
                <Link to="/user/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[13px] font-medium text-stone-700 transition hover:bg-white" onClick={closeMenus}>
                  <FontAwesomeIcon icon={faCalendar} /> {t('myBookings')}
                </Link>
                <Link to="/user/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-[13px] font-medium text-stone-700 transition hover:bg-white" onClick={closeMenus}>
                  <FontAwesomeIcon icon={faGear} /> {t('profileSettings')}
                </Link>
                <button className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[13px] font-medium text-red-700 transition hover:bg-red-50" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faArrowRight} /> {t('logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2.5 lg:hidden">
                <Link to="/user/login" className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-stone-700 transition hover:border-amber-300 hover:bg-amber-50" onClick={closeMenus}>
                <FontAwesomeIcon icon={faUserCircle} /> {t('loginSignup')}
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8f1d34] to-[#7a1024] px-2.5 py-1.5 text-[12px] font-semibold text-white shadow-[0_6px_18px_rgba(122,16,36,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(122,16,36,0.35)]" onClick={handleBookNow}>
                <FontAwesomeIcon icon={faCalendar} /> {t('bookPuja')}
              </button>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <div className="relative" ref={userMenuRef}>
                <button className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-stone-700 transition hover:border-amber-300 hover:bg-amber-50" onClick={toggleUserMenu}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-[12px] font-bold text-amber-950">{user?.name?.charAt(0) || 'U'}</span>
                  <span className="max-w-28 truncate">{user?.name?.split(' ')[0] || 'User'}</span>
                  <FontAwesomeIcon icon={faChevronDown} className={`text-[9px] transition ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-amber-100 bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-950">{user?.name?.charAt(0) || 'U'}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-800">{user?.name}</p>
                        <p className="truncate text-xs text-stone-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="my-2 h-px bg-amber-100" />
                    <Link to="/user/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-50" onClick={closeMenus}>
                      <FontAwesomeIcon icon={faBook} /> {t('dashboard')}
                    </Link>
                    <Link to="/user/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-50" onClick={closeMenus}>
                      <FontAwesomeIcon icon={faCalendar} /> {t('myBookings')}
                    </Link>
                    <Link to="/user/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-amber-50" onClick={closeMenus}>
                      <FontAwesomeIcon icon={faGear} /> {t('settings')}
                    </Link>
                    <div className="my-2 h-px bg-amber-100" />
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50" onClick={handleLogout}>
                      <FontAwesomeIcon icon={faArrowRight} /> {t('logout')}
                    </button>
                  </div>
                )}
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8f1d34] to-[#7a1024] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_8px_24px_rgba(122,16,36,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(122,16,36,0.35)]" onClick={handleBookNow}>
                <FontAwesomeIcon icon={faCalendar} /> {t('bookPuja')}
              </button>
            </>
          ) : (
            <>
              <Link to="/user/login" className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-stone-700 transition hover:border-amber-300 hover:bg-amber-50" onClick={closeMenus}>
                <FontAwesomeIcon icon={faUserCircle} /> {t('loginSignup')}
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8f1d34] to-[#7a1024] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_8px_24px_rgba(122,16,36,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(122,16,36,0.35)]" onClick={handleBookNow}>
                <FontAwesomeIcon icon={faCalendar} /> {t('bookPuja')}
              </button>
            </>
          )}
        </div>

        {isMenuOpen && <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={closeMenus} />}
      </nav>
    </div>
  </header>
);
}
export default Header;
