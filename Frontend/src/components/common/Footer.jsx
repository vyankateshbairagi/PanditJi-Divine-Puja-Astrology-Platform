import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, HelpCircle, MessageCircle, Search, Smartphone, HeadphonesIcon } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faXTwitter, faInstagram, faYoutube, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

/* ─── data ────────────────────────────────────────────── */
const QUICK_LINKS = [
  { label: 'Home',           to: '/'               },
  { label: 'About Us',       to: '/about'          },
  { label: 'Services',       to: '/Services'       },
  { label: 'Find Pandit',    to: '/find-pandit'    },
  { label: 'Astro Services', to: '/astro-services' }
];

const PUJA_SERVICES = [
  { label: 'Regular Puja',  to: '/services' },
  { label: 'Festival Puja', to: '/services' },
  { label: 'Hawan & Yagya', to: '/services' },
  { label: 'Vedic Rituals', to: '/services' },
  { label: 'More Services', to: '/services' },

];

const SUPPORT_LINKS = [
  { label: 'Help Center',   to: '/help',    Icon: HelpCircle       },
  { label: 'Live Chat',     to: '/chat',    Icon: MessageCircle    },
  { label: 'Call Support',  to: '/contact', Icon: PhoneCall        },
  { label: 'Email Support', to: '/contact', Icon: Mail             },
  { label: 'Track Booking', to: '/track',   Icon: Search           },
];

const SOCIAL = [
  { fa: faFacebookF, href: '#',                                  label: 'Facebook'  },
  { fa: faXTwitter,  href: '#',                                  label: 'Twitter'   },
  { fa: faInstagram, href: 'https://instagram.com', label: 'Instagram' },
  { fa: faYoutube,   href: 'https://youtube.com/',               label: 'YouTube'   },
  { fa: faWhatsapp,  href: 'https://wa.me/',         label: 'WhatsApp'  },
];


/* ─── component ───────────────────────────────────────── */
const Footer = () => {
  const [email,      setEmail]      = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="mt-auto w-full overflow-visible bg-[linear-gradient(180deg,#FDF6EC_0%,#F5E8D0_55%,#EDD9B5_100%)] text-[#2E1A06]">

      <div className="mx-auto grid max-w-[1450px] gap-4 px-5 py-10 lg:grid-cols-5 lg:gap-0 lg:px-8 lg:py-[15px]">
        <div className="space-y-4 lg:col-span-1 lg:border-r lg:border-amber-200/50 lg:pr-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-[radial-gradient(circle,rgba(201,146,42,0.14)_0%,rgba(201,146,42,0.03)_100%)] shadow-[0_0_0_4px_rgba(201,146,42,0.07),0_4px_14px_rgba(201,146,42,0.15)]">
              <span className="font-serif text-[26px] leading-none text-[#C8520A] drop-shadow-[0_0_10px_rgba(200,82,10,0.5)]">ॐ</span>
            </div>
            <div>
              <p className="m-0 font-serif text-xl font-bold leading-tight tracking-[0.3px] text-[#2E1A06]">PanditJi</p>
              <p className="mt-1 font-serif text-[8.5px] font-medium uppercase tracking-[1.8px] text-amber-600">Bringing Traditions Closer To You</p>
            </div>
          </div>

          <p className="max-w-sm text-[13.5px] leading-7 text-[#5C3410]">
            Bringing trusted Pandits closer for authentic Pujas, rituals, and divine traditions.
          </p>

          <div className="flex flex-wrap gap-2.5">
            {SOCIAL.map(({ fa, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-amber-200 bg-amber-50 text-[13px] text-[#5C3410] transition duration-300 hover:-translate-y-0.5 hover:border-transparent hover:text-white hover:shadow-[0_6px_16px_rgba(201,146,42,0.35)]">
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-[#C8520A] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <FontAwesomeIcon icon={fa} className="relative z-10" />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:border-r lg:border-amber-200/50 lg:px-8">
          <h4 className="mb-4 font-serif text-sm font-semibold uppercase tracking-[2px] text-[#5C3410]">Quick Links</h4>
          <ul className="list-none m-0 p-0 space-y-2">
            {QUICK_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="inline-flex items-center gap-2 text-[15px] text-[#2E1A06] transition hover:translate-x-0.5 hover:text-[#7A1024]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:border-r lg:border-amber-200/50 lg:px-8">
          <h4 className="mb-4 font-serif text-sm font-semibold uppercase tracking-[2px] text-[#5C3410]">Puja Services</h4>
          <ul className="list-none m-0 p-0 space-y-2">
            {PUJA_SERVICES.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="inline-flex items-center gap-2 text-[15px] text-[#2E1A06] transition hover:translate-x-0.5 hover:text-[#7A1024]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:border-r lg:border-amber-200/50 lg:px-8">
          <h4 className="mb-4 font-serif text-sm font-semibold uppercase tracking-[2px] text-[#5C3410]">Support</h4>
          <ul className="list-none m-0 p-0 space-y-2">
            {SUPPORT_LINKS.map(({ label, to, Icon }) => (
              <li key={label}>
                <Link to={to} className="inline-flex items-center gap-2 text-[15px] text-[#2E1A06] transition hover:translate-x-0.5 hover:text-[#7A1024]">
                  <Icon size={14} className="text-amber-600" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:px-8">
          <h4 className="mb-4 font-serif text-sm font-semibold uppercase tracking-[2px] text-[#5C3410]">Contact Us</h4>
          <ul className="list-none m-0 p-0 space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700"><PhoneCall size={13} /></span>
              <div>
                <small className="block text-[11px] uppercase tracking-[1px] text-[#8B5E2A]">Call Us</small>
                <a className="text-[15px] text-[#2E1A06] transition hover:text-[#7A1024]" href="tel:+919373120370">+91 93731 20370</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700"><Mail size={13} /></span>
              <div>
                <small className="block text-[11px] uppercase tracking-[1px] text-[#8B5E2A]">Email Us</small>
                <a className="text-[15px] text-[#2E1A06] transition hover:text-[#7A1024]" href="mailto:info@panditji.com">info@panditji.com</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700"><MapPin size={13} /></span>
              <div>
                <small className="block text-[11px] uppercase tracking-[1px] text-[#8B5E2A]">Our Office</small>
                <span className="text-[15px] text-[#2E1A06]">Pune, Maharashtra, India</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-amber-200/60 bg-[#f5e8d0]/40 px-5 py-5">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 text-center lg:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-2 font-serif text-sm text-[#5C3410]">
            <span>ॐ सर्वे भवन्तु सुखिनः</span>
            <span className="text-amber-500">·</span>
            <span>May all beings be happy</span>
          </p>
          <p className="text-sm text-[#5C3410]">© {new Date().getFullYear()} PanditJi. All rights reserved. Made with for sacred services.</p>
          <div className="flex items-center gap-2 text-sm text-[#5C3410]">
            <Link to="/privacy-policy" className="transition hover:text-[#7A1024]">Privacy</Link>
            <span className="text-amber-500">·</span>
            <Link to="/terms-conditions" className="transition hover:text-[#7A1024]">Terms</Link>
            <span className="text-amber-500">·</span>
            <Link to="/cancellation-policy" className="transition hover:text-[#7A1024]">Cancellation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
