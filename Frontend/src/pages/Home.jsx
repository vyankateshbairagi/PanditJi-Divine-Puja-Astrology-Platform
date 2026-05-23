// Frontend/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import Skeleton from '../components/common/Skeleton';
import HeroSection from '../components/common/HeroSection';
import ServicesSection from '../components/common/ServicesSection';
import HomeHighlightsSection from '../components/common/HomeHighlightsSection';
import { useLanguage } from '../context/LanguageContext';

import { useNavigate } from 'react-router-dom';

function Home() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();


  useEffect(() => {
    // Simulate loading or wait for images to load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);


  const steps = [
    {
      img: "images/puja.png",

      title: "Pick your Puja",
      titleKey: 'pickPuja',
    },
    {
      img: "images/calendar.png",
      title: "Select Muhurth",
      titleKey: 'selectMuhurth',
    },
    {
      img: "images/mobile.png",
      title: "Book your Puja",
      titleKey: 'bookYourPuja',
    },
    {
      img: "images/havan.png",
      title: "Perform Puja at Muhurth",
      titleKey: 'performPujaAtMuhurth',
    },
  ];

  if (loading) {
    return (
      <>
        <Skeleton.Banner />
        <Skeleton.HowItWorks />
        <Skeleton.HomeHighlights />
        <Skeleton.JoinPandit />
      </>
    );
  }

  return (
    <>
      <HeroSection />
      <ServicesSection />
      {/* How It Works Section */}
      <section className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-[1360px] sm:w-[calc(100%-2.5rem)] lg:w-[calc(100%-3rem)]">
        

        {/* Main Box */}
        <div className="relative overflow-hidden rounded-[22px] border border-[#efdfc3] bg-[#fffaf3] px-4 py-5 shadow-[0_6px_18px_rgba(0,0,0,0.04)] sm:px-5">
         {/* Heading */}
        <div className="mb-5 text-center">
          <h2 className="text-[clamp(1.7rem,5vw,2.125rem)] font-bold text-[#3c2517]">
            {t('How It Works')}
          </h2>
        </div>
          {/* Connector line */}
          <div className="absolute left-[12%] right-[12%] top-[110px] hidden h-[2px] bg-[#ecdab6] xl:block" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex min-w-0 flex-col items-center text-center"
              >
                {/* top icon */}
                <div className="relative z-10 flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#e6c98f] bg-gradient-to-b from-[#fffdfa] to-[#f8e6bf] shadow-[0_6px_14px_rgba(201,146,42,0.12)]">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="h-[24px] w-[24px] object-contain"
                  />
                </div>

                {/* tiny connector dot */}
                {index !== steps.length - 1 && (
                  <span className="absolute right-[-6px] top-[28px] z-20 hidden h-[8px] w-[8px] rounded-full bg-[#d6a14d] xl:block" />
                )}

                {/* step number */}
                <span className="mt-3 text-[18px] font-bold text-[#d39a3d]">
                  0{index + 1}
                </span>

                {/* title */}
                <h4 className="mt-1 text-[16px] font-semibold text-[#2f1b0d] sm:text-[18px]">
                  {t(step.titleKey)}
                </h4>

                {/* description */}
                <p className="mt-1 max-w-[180px] text-[12px] leading-[1.45] text-[#776250] sm:text-[13px]">
                  {index === 0 &&
                    'Select the puja or service you need.'}

                  {index === 1 &&
                    'Pick a verified Pandit as per your preference.'}

                  {index === 2 &&
                    'Choose date & time and make payment.'}

                  {index === 3 &&
                    'Pandit performs puja at your chosen time.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeHighlightsSection />

      {/* Join as Pandit Section */}
      <section className="px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      
        <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[20px] bg-[linear-gradient(90deg,#7f0f28_0%,#8e162e_48%,#9b1630_100%)] shadow-[0_14px_36px_rgba(113,18,34,0.22)]">
          <div className="relative flex min-h-[176px] flex-col justify-between gap-5 px-4 py-5 sm:px-7 sm:py-6 lg:min-h-[182px] lg:flex-row lg:items-center lg:px-10 lg:py-8">
            <div className="pointer-events-none absolute right-5 top-4 hidden h-28 w-28 rounded-full border border-white/10 lg:block" />
            <div className="pointer-events-none absolute bottom-3 right-7 hidden h-20 w-20 rounded-full border border-white/10 lg:block" />
            <div className="pointer-events-none absolute right-6 top-6 hidden h-16 w-16 rounded-full border border-[#d8a24d]/15 lg:block" />

            <div className="relative flex items-end gap-3 lg:gap-4">
              <div className="relative -mb-16 hidden w-[340px] shrink-0 self-start lg:block lg:-mt-44 lg:-ml-16">
                <img
                  src="/images/pandit.png"
                  alt="Pandit"
                  className="h-[395px] w-full object-contain object-bottom drop-shadow-[0_24px_30px_rgba(0,0,0,0.22)]"
                />
              </div>

              <div className="max-w-[560px] text-center text-white lg:text-left">
                <div className="mb-2.5 inline-flex rounded-full bg-white/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]">
                  PANDIT FOR PUJA
                </div>

                <h2 className="m-0 text-[clamp(1.8rem,3.5vw,2.95rem)] font-serif font-semibold leading-[1.05] tracking-[-0.4px] text-white">
                  Join Us as a Pandit
                </h2>

                <p className="mt-2.5 max-w-xl text-[14px] leading-7 text-white/88 sm:text-[15px]">
                  Become a part of our spiritual community. Share your knowledge,
                  perform pujas, and connect with devotees across India.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col gap-4 text-white lg:max-w-[360px] lg:items-start lg:pr-0">
              <div className="grid gap-2.5 text-sm font-medium sm:grid-cols-2 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-3">
                <div className="flex items-center gap-2.5 whitespace-nowrap">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d6a64a] text-[11px] font-bold text-white shadow-[0_6px_12px_rgba(214,166,74,0.25)]">
                    ✓
                  </span>
                  <span>Flexible Schedule</span>
                </div>
                <div className="flex items-center gap-2.5 whitespace-nowrap">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d6a64a] text-[11px] font-bold text-white shadow-[0_6px_12px_rgba(214,166,74,0.25)]">
                    ✓
                  </span>
                  <span>Earn Respect &amp; Income</span>
                </div>
                <div className="flex items-center gap-2.5 whitespace-nowrap">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d6a64a] text-[11px] font-bold text-white shadow-[0_6px_12px_rgba(214,166,74,0.25)]">
                    ✓
                  </span>
                  <span>Reach More Devotees</span>
                </div>
                <div className="flex items-center gap-2.5 whitespace-nowrap">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d6a64a] text-[11px] font-bold text-white shadow-[0_6px_12px_rgba(214,166,74,0.25)]">
                    ✓
                  </span>
                  <span>Verified Platform</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/join-pandit')}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-6.5 py-3 text-sm font-semibold text-[#8b2030] shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)] sm:px-7 sm:py-3.5 sm:text-base"
              >
                Join Now <span className="text-[18px] leading-none">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

export default Home;
