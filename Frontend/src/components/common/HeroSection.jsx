import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Flower2,
  ShieldCheck,
  CalendarCheck2,
  Lock,
  Headset,
  Star,
} from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  const testimonials = ['/images/avatar1.png', '/images/avatar2.png', '/images/avatar3.png', '/images/avatar4.png'];
  const avatarFallback = '/images/icon.png';

  const highlights = [
    {
      icon: <ShieldCheck size={22} aria-hidden="true" />,
      title: 'Verified Pandits',
      description: 'Background verified & experienced',
    },
    {
      icon: <CalendarCheck2 size={22} aria-hidden="true" />,
      title: 'Easy Booking',
      description: 'Book in just a few simple steps',
    },
    {
      icon: <Lock size={22} aria-hidden="true" />,
      title: 'Secure Payments',
      description: '100% secure & multiple payment options',
    },
    {
      icon: <Headset size={22} aria-hidden="true" />,
      title: '24/7 Support',
      description: 'We are here to help you anytime',
    },
    {
      icon: <Star size={22} aria-hidden="true" />,
      title: '4.8 Rating',
      description: 'From 2.5K+ happy devotees',
    },
  ];

  const handleBookPuja = () => {
    navigate('/services');
  };

  const handleExploreServices = () => {
    navigate('/services');
  };

  return (
    <section className="mx-auto flex w-full max-w-[1360px] flex-col px-3 pb-6 pt-3 sm:px-4">
      <div
        className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-cover bg-center shadow-[0_20px_60px_rgba(72,42,16,0.18)] sm:min-h-[340px] lg:min-h-[380px]"
        style={{ backgroundImage: 'url(/images/hero-bg.png)' }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,246,230,0.97)_0%,rgba(255,246,230,0.88)_40%,rgba(255,246,230,0.45)_70%,rgba(255,246,230,0.06)_100%),linear-gradient(180deg,rgba(255,244,219,0.22)_0%,rgba(255,244,219,0.08)_100%)]" />

        <div className="relative z-10 flex min-h-[320px] items-center justify-start px-5 py-8 sm:min-h-[340px] sm:px-8 lg:min-h-[380px] lg:px-16">
          <div className="max-w-[860px] animate-[heroFadeIn_650ms_ease-out] text-left text-[#341f12]">
            <div className="mb-4 inline-flex w-fit items-center gap-2.5 text-[15px] font-semibold text-[#614327] sm:text-base">
              <Flower2 size={16} aria-hidden="true" />
              <span>Trusted by 10,000+ Devotees</span>
              <span className="text-[13px] text-[#c28d2e]">||</span>
            </div>

            <h1 className="m-0 font-serif text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.08] tracking-[-0.5px] text-[#3a2314]">
              Experience Divine
              <br />
              <span className="text-[#d4931f]">Blessings</span> at Home
            </h1>

            <p className="mt-3 max-w-[760px] text-base leading-[1.65] text-[#5f4a3a] sm:text-[15px]">
              Book verified Pandits, explore spiritual services,
              <br />
              and perform sacred rituals with faith and devotion.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3.5">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(125,29,47,0.2)] bg-gradient-to-b from-[#7e1d2f] to-[#661725] px-6 py-3 text-[15px] font-bold text-[#ffefe0] shadow-[0_14px_22px_rgba(117,28,44,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_28px_rgba(117,28,44,0.38)]"
                onClick={handleBookPuja}
              >
                <CalendarDays size={18} aria-hidden="true" />
                Book a Puja
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-[rgba(205,152,51,0.6)] bg-[rgba(255,250,240,0.8)] px-6 py-3 text-[15px] font-bold text-[#5a3d20] transition hover:-translate-y-0.5 hover:border-[#d39a37] hover:shadow-[0_8px_16px_rgba(129,84,24,0.16)]"
                onClick={handleExploreServices}
              >
                <Flower2 size={18} aria-hidden="true" />
                Explore Services
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                {testimonials.map((avatar, idx) => (
                  <img
                    key={`${avatar}-${idx}`}
                    src={avatar}
                    alt={`Devotee ${idx + 1}`}
                    className="-ml-2 h-9 w-9 rounded-full border-2 border-[#fefaf1] object-cover shadow-[0_2px_6px_rgba(60,35,16,0.2)] first:ml-0"
                    onError={(e) => {
                      if (e.currentTarget.src.includes(avatarFallback)) return;
                      e.currentTarget.src = avatarFallback;
                    }}
                  />
                ))}
              </div>
              <div className="text-[#4a2d1b]">
                <p className="m-0 text-sm font-bold text-[#4a2d1b]">10,000+ Happy Devotees</p>
                <p className="m-0 mt-0.5 text-sm text-[#6a503e]">
                  <strong className="text-[#3d2517]">4.8</strong> <span className="tracking-[2px] text-[#d8a338]">★★★★★</span> (2.5K Reviews)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-3 grid overflow-hidden rounded-2xl border border-[rgba(216,190,148,0.48)] bg-[linear-gradient(180deg,#fffdfa_0%,#f9f2e7_100%)] shadow-[0_16px_28px_rgba(85,52,21,0.14)] lg:grid-cols-5" aria-label="Hero highlights">
        {highlights.map((item) => (
          <article key={item.title} className="flex items-center gap-3 border-b border-r border-[rgba(229,210,176,0.8)] px-5 py-4 last:border-b-0 last:border-r-0 lg:py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff2d9] text-[#8f5400]">
              {item.icon}
            </div>
            <div>
              <h3 className="m-0 text-base font-semibold leading-[1.25] text-[#3b2618]">{item.title}</h3>
              <p className="m-0 mt-1 text-[13px] leading-[1.42] text-[#6e5645]">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
