// Frontend/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import JoinPandit from './JoinPandit';
import Skeleton from '../components/common/Skeleton';
import HeroSection from '../components/common/HeroSection';
import ServicesSection from '../components/common/ServicesSection';
import SpecialOfferBanner from '../components/common/SpecialOfferBanner';
import { useLanguage } from '../context/LanguageContext';
import { Flower2 } from 'lucide-react';

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
        <Skeleton.JoinPandit />
      </>
    );
  }

  return (
    <>
      <SpecialOfferBanner />
      <HeroSection />
      <ServicesSection />
      {/* How It Works Section */}
      <section className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-[1360px]">
        

        {/* Main Box */}
        <div className="relative overflow-hidden rounded-[22px] border border-[#efdfc3] bg-[#fffaf3] px-5 py-5 shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
         {/* Heading */}
        <div className="mb-5 text-center">
          <h2 className="text-[34px] font-bold text-[#3c2517]">
            {t('How It Works')}
          </h2>
        </div>
          {/* Connector line */}
          <div className="absolute left-[12%] right-[12%] top-[110px] hidden h-[2px] bg-[#ecdab6] xl:block" />

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-0">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center"
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
                <h4 className="mt-1 text-[18px] font-semibold text-[#2f1b0d]">
                  {t(step.titleKey)}
                </h4>

                {/* description */}
                <p className="mt-1 max-w-[180px] text-[13px] leading-[1.45] text-[#776250]">
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

      {/* Join as Pandit Section */}

      <section className="relative mt-8 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,224,170,0.35),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(126,29,47,0.08),transparent_34%),linear-gradient(180deg,#fffaf1_0%,#f8ecdb_100%)] px-4 py-10 sm:px-5 lg:px-6 lg:py-14">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-6 rounded-[28px] border border-[rgba(198,154,82,0.16)] bg-white/70 p-6 shadow-[0_20px_50px_rgba(88,54,22,0.08)] backdrop-blur-[10px] sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex rounded-full bg-[rgba(126,29,47,0.08)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7e1d2f]">
              JOIN AS PANDIT
            </div>
            <h2 className="m-0 text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-tight text-[#3c2517]">
              {t('joinUsAsPandit')}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#6c5643]">
              {t('joinUsDescription')}
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:max-w-xl lg:items-end">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(197,146,56,0.16)] bg-white/70 px-4 py-2 text-sm font-semibold text-[#3a2416] shadow-sm">
                <span className="text-[#c88a1c]">✓</span> {t('flexibleSchedule')}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(197,146,56,0.16)] bg-white/70 px-4 py-2 text-sm font-semibold text-[#3a2416] shadow-sm">
                <span className="text-[#c88a1c]">✓</span> {t('earnRespectIncome')}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(197,146,56,0.16)] bg-white/70 px-4 py-2 text-sm font-semibold text-[#3a2416] shadow-sm">
                <span className="text-[#c88a1c]">✓</span> {t('reachMoreDevotees')}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(197,146,56,0.16)] bg-white/70 px-4 py-2 text-sm font-semibold text-[#3a2416] shadow-sm">
                <span className="text-[#c88a1c]">✓</span> {t('verifiedPlatform')}
              </div>
            </div>

            <button
              onClick={() => navigate('/join-pandit')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8f1d34] to-[#7a1024] px-8 py-3.5 text-base font-semibold text-white shadow-[0_10px_28px_rgba(122,16,36,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(122,16,36,0.35)]"
            >
              {t('joinNow')} <span>→</span>
            </button>
          </div>
        </div>
      </section>

    </>
  );
}

export default Home;
