import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const SERVICES = [
  {
    emoji: '🪔',
    titleKey: 'pujaServices',
    descriptionKey: 'pujaServicesDesc',
    tag: 'Most Booked',
    color: '#a52240',
    link: '/services',
  },
  {
    emoji: '🧘',
    titleKey: 'findAPandit',
    descriptionKey: 'findAPanditDesc',
    tag: 'Verified',
    color: '#d49a2a',
    link: '/find-pandit',
  },
  {
    emoji: '🌙',
    titleKey: 'astrology',
    descriptionKey: 'astrologyDesc',
    tag: 'Popular',
    color: '#7d1324',
    link: '/astro-services',
  },
  {
    emoji: '📿',
    titleKey: 'rudrakshaProducts',
    descriptionKey: 'rudrakshaProductsDesc',
    tag: 'Sacred',
    color: '#8a5b18',
    link: '/services',
  },
  {
    emoji: '🔥',
    titleKey: 'videoConsultation',
    descriptionKey: 'videoConsultationDesc',
    tag: 'Live',
    color: '#c8520a',
    link: '/astro-services',
  },
  {
    emoji: '📅',
    titleKey: 'dailyPancham',
    descriptionKey: 'dailyPanchamDesc',
    tag: 'Daily',
    color: '#5a7a1a',
    link: '/services',
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(201,146,42,0.08)_0%,transparent_60%),linear-gradient(180deg,#FDF6EC_0%,#F5E8D0_60%,#EDD9B5_100%)] px-4 py-11 sm:px-5 sm:py-14 lg:px-6 lg:py-16">
      <div className="mx-auto max-w-[1360px] text-center">
        <div className="mb-10">
          <span className="mb-3 inline-block font-serif text-[11px] font-semibold uppercase tracking-[3px] text-[#C9922A] drop-shadow-[0_0_6px_rgba(201,146,42,0.4)]">✦ Sacred Offerings ✦</span>
          <h2 className="m-0 mb-3 font-serif text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-[1.15] tracking-[-0.3px] text-[#2E1A06]">{t('ourServices')}</h2>
          <p className="m-0 font-serif text-[17px] leading-[1.6] italic text-[#8B5E2A]">{t('comprehensiveSpiritualServices')}</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-20 bg-gradient-to-r from-transparent via-[#E8B84B] to-[#C8520A]" />
            <span className="font-serif text-[22px] leading-none text-[#C8520A]">ॐ</span>
            <span className="h-px w-20 bg-gradient-to-r from-[#C8520A] via-[#E8B84B] to-transparent" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((svc, i) => (
            <button
              key={i}
              className="group relative flex min-h-[260px] flex-col gap-3 overflow-hidden rounded-[20px] border border-[rgba(201,146,42,0.2)] bg-white/70 px-7 py-8 text-left backdrop-blur-[8px] transition duration-300 hover:-translate-y-2 hover:border-[rgba(201,146,42,0.38)] hover:bg-white/90 hover:shadow-[0_20px_48px_rgba(201,146,42,0.14),0_4px_12px_rgba(46,26,6,0.08)]"
              style={{ '--cc': svc.color }}
              onClick={() => navigate(svc.link)}
              aria-label={t(svc.titleKey)}
            >
              <span className="absolute left-0 right-0 top-0 h-[3px] origin-left scale-x-0 rounded-t-[20px] bg-[var(--cc)] transition-transform duration-300 group-hover:scale-x-100" />
              <span className="absolute right-4 top-4 rounded-full border border-[color-mix(in_srgb,var(--cc)_25%,transparent)] bg-[color-mix(in_srgb,var(--cc)_10%,white)] px-2.5 py-1 font-serif text-[9px] font-bold uppercase tracking-[1.5px] text-[var(--cc)]">{svc.tag}</span>

              <div className="flex h-[62px] w-[62px] items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--cc)_22%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--cc)_14%,white),color-mix(in_srgb,var(--cc)_6%,white))] text-[28px] transition duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-[0_8px_20px_color-mix(in_srgb,var(--cc)_30%,transparent)]">
                {svc.emoji}
              </div>

              <div className="flex-1">
                <h3 className="mb-2 text-[15px] font-bold leading-[1.3] tracking-[0.2px] text-[#2E1A06]">{t(svc.titleKey)}</h3>
                <p className="m-0 font-serif text-[14.5px] leading-[1.6] text-[#8B5E2A]">{t(svc.descriptionKey)}</p>
              </div>

              <span className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--cc)_25%,transparent)] bg-[color-mix(in_srgb,var(--cc)_10%,white)] text-base font-bold text-[var(--cc)] transition duration-300 group-hover:translate-x-1 group-hover:border-transparent group-hover:bg-[var(--cc)] group-hover:text-white">
                →
              </span>
            </button>
          ))}
        </div>

        <div className="mt-11 flex justify-center">
          <button
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#C9922A] bg-transparent px-9 py-3.5 font-serif text-[13px] font-bold tracking-[0.5px] text-[#2E1A06] transition duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-gradient-to-br hover:from-[#C9922A] hover:to-[#C8520A] hover:text-white hover:shadow-[0_8px_24px_rgba(201,146,42,0.35)]"
            onClick={() => navigate('/services')}
          >
            View All Services <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
