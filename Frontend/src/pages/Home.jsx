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
      
      <section className="mx-auto mt-3 w-[calc(100%-2rem)] max-w-[1360px] overflow-hidden rounded-[28px] border border-[rgba(198,154,82,0.16)] bg-[linear-gradient(180deg,#fffaf1_0%,#f8ecdb_100%)] px-4 py-10 text-center shadow-[0_20px_50px_rgba(88,54,22,0.08)] sm:w-[calc(100%-1.5rem)] sm:px-5 sm:py-12 lg:px-6 lg:py-16">
        <div className="mx-auto mb-8 max-w-[760px]">
          <div className="mx-auto mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-[rgba(126,29,47,0.08)] px-3.5 py-2 text-[13px] font-bold uppercase tracking-[0.08em] text-[#7e1d2f]">
            <Flower2 size={14} aria-hidden="true" />
            <span>{t('howItWorksTitle')}</span>
          </div>
          <h2 className="m-0 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-[1.15] text-[#3c2517]">
            {t('howItWorksSubtitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-[640px] text-base leading-[1.65] text-[#6c5643] sm:text-[15px]">
            A calm, guided puja journey shaped around trust, clarity, and devotion.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="min-w-0">
              <div className="flex h-full min-h-[220px] flex-col items-center justify-start gap-4 rounded-[22px] border border-[rgba(197,146,56,0.24)] bg-[rgba(255,252,247,0.88)] px-5 py-6 shadow-[0_14px_30px_rgba(101,66,24,0.09)] backdrop-blur-[10px] sm:min-h-[240px] lg:min-h-[260px]">
                <div className="w-fit rounded-full bg-[rgba(200,138,28,0.12)] px-3 py-1.5 text-xs font-extrabold tracking-[0.12em] text-[#c88a1c]">
                  0{index + 1}
                </div>
                <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full border border-[rgba(194,143,46,0.26)] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.96)_0%,rgba(255,242,218,0.98)_44%,rgba(246,225,188,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_22px_rgba(120,76,20,0.12)] lg:h-[94px] lg:w-[94px]">
                  <img src={step.img} alt={step.title} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-[#8e6b4d]">Step {index + 1}</p>
                  <h4 className="m-0 text-[16px] leading-[1.3] text-[#3a2416] lg:text-[18px]">{t(step.titleKey)}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-7 max-w-[720px] rounded-full border border-[rgba(197,146,56,0.14)] bg-white/50 px-4 py-3 text-sm leading-[1.6] text-[#6d5641]">
          Verified pandits, secure booking, and on-time rituals in one simple flow.
        </p>
      </section>

    

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
