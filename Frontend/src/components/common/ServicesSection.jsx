import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
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
];

const ServicesSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF8F1] to-[#F7E9D1] px-4 py-6 sm:px-5 lg:px-6">
      {/* Background blur */}
      <div className="absolute left-[-120px] top-[-120px] h-[220px] w-[220px] rounded-full bg-[#d49a2a]/10 blur-[100px]" />
      <div className="absolute bottom-[-100px] right-[-100px] h-[220px] w-[220px] rounded-full bg-[#a52240]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-[1320px]">
        {/* Header */}
        <div className="mb-5 text-center">
          <h2 className="text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-tight text-[#4b0909]">
            {t('ourServices')}
          </h2>

          <p className="mx-auto mt-1 max-w-[620px] text-[13px] text-[#8B5E2A]">
            {t('comprehensiveSpiritualServices')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SERVICES.map((svc, i) => (
            <button
              key={i}
              onClick={() => navigate(svc.link)}
              aria-label={t(svc.titleKey)}
              style={{ '--cc': svc.color }}
              className="group relative overflow-hidden rounded-[22px] border border-white/50 bg-white/75 p-4 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
            >
              {/* Gradient glow */}
              <div
                className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(135deg, transparent, color-mix(in srgb, var(--cc) 6%, white))',
                }}
              />

              {/* Top Row */}
              <div className="relative flex items-start justify-between">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] text-[20px]"
                    style={{
                      background:
                        'color-mix(in srgb, var(--cc) 10%, white)',
                    }}
                  >
                    {svc.emoji}
                  </div>

                  <div>
                    <span
                      className="mb-1 inline-flex rounded-full px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.8px]"
                      style={{
                        background:
                          'color-mix(in srgb, var(--cc) 10%, white)',
                        color: svc.color,
                      }}
                    >
                      {svc.tag}
                    </span>

                    <h3 className="text-[14px] font-semibold text-[#2E1A06]">
                      {t(svc.titleKey)}
                    </h3>
                  </div>
                </div>

                {/* Arrow */}
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full transition duration-300 group-hover:scale-110"
                  style={{
                    background:
                      'color-mix(in srgb, var(--cc) 10%, white)',
                    color: svc.color,
                  }}
                >
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:rotate-45"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="relative mt-3 line-clamp-2 text-[12px] leading-[1.45] text-[#8B5E2A]">
                {t(svc.descriptionKey)}
              </p>

              {/* Bottom line */}
              <div
                className="mt-3 h-[2px] w-12 rounded-full transition-all duration-300 group-hover:w-20"
                style={{
                  background: svc.color,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;