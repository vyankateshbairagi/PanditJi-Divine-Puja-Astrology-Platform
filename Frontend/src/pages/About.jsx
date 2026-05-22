import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="relative overflow-x-hidden bg-[#fdf6ec] text-[#2a1a0a]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(212,162,76,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(143,91,19,0.05)_0%,transparent_50%)]" />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] px-6 py-20 text-center sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        <motion.h1 className="relative mx-auto mb-4 max-w-4xl bg-[linear-gradient(135deg,#fff,rgba(255,255,255,0.8))] bg-clip-text text-4xl font-extrabold tracking-[-0.02em] text-transparent drop-shadow-sm sm:text-5xl lg:text-6xl" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          {t('experienceDivineConnections')} ✨
        </motion.h1>
        <motion.p className="relative mx-auto max-w-2xl text-base leading-7 text-white/90 sm:text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {t('aboutDescription')}
        </motion.p>
      </section>

      {/* STATS SECTION */}
      <section className="relative mx-auto flex max-w-6xl flex-wrap justify-center gap-6 px-6 py-16 sm:py-20">
        {[
          { num: '1000+', labelKey: 'pujasCompleted' },
          { num: '500+', labelKey: 'happyDevoteesLabel' },
          { num: '150+', labelKey: 'verifiedPandits' },
        ].map((item, i) => (
          <motion.div key={i} className="min-w-[200px] rounded-2xl border border-[rgba(212,162,76,0.2)] bg-white/70 px-8 py-6 text-center shadow-md backdrop-blur-md transition hover:-translate-y-2 hover:border-[rgba(212,162,76,0.4)] hover:bg-white/90 hover:shadow-[0_0_20px_rgba(212,162,76,0.2)]" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
            <h2 className="mb-2 bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">{item.num}</h2>
            <p className="text-sm font-medium tracking-[0.5px] text-[#6f6458] sm:text-base">{t(item.labelKey)}</p>
          </motion.div>
        ))}
      </section>

      {/* MISSION */}
      <section className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 px-6 py-16 sm:py-20">
        <motion.div className="min-w-[280px] flex-1 rounded-2xl border border-[rgba(212,162,76,0.2)] bg-white/70 p-8 text-center shadow-md backdrop-blur-md transition hover:scale-[1.02] hover:border-[rgba(212,162,76,0.4)] hover:bg-white/90 hover:shadow-lg" whileHover={{ scale: 1.05 }}>
          <h2 className="mb-4 bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] bg-clip-text text-2xl font-bold text-transparent">{t('ourMission')}</h2>
          <p className="text-base leading-7 text-[#4a3520]">{t('missionDescription')}</p>
        </motion.div>

        <motion.div className="min-w-[280px] flex-1 rounded-2xl border border-[rgba(212,162,76,0.2)] bg-white/70 p-8 text-center shadow-md backdrop-blur-md transition hover:scale-[1.02] hover:border-[rgba(212,162,76,0.4)] hover:bg-white/90 hover:shadow-lg" whileHover={{ scale: 1.05 }}>
          <h2 className="mb-4 bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] bg-clip-text text-2xl font-bold text-transparent">{t('ourVision')}</h2>
          <p className="text-base leading-7 text-[#4a3520]">{t('visionDescription')}</p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
        <h2 className="relative inline-block text-3xl font-bold text-[#2a1a0a] sm:text-4xl after:absolute after:-bottom-3 after:left-1/2 after:h-[3px] after:w-[60px] after:-translate-x-1/2 after:rounded-full after:bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)]">{t('whyChooseUs')}</h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'verifiedExperts',
            'easyBooking',
            'wideServices',
            'securePlatform'
          ].map((text, i) => (
            <motion.div key={i} className="rounded-xl border border-[rgba(212,162,76,0.2)] bg-white/70 p-6 text-center shadow-md backdrop-blur-md transition hover:-translate-y-1 hover:scale-[1.02] hover:border-[rgba(212,162,76,0.4)] hover:bg-white/90 hover:shadow-[0_0_20px_rgba(212,162,76,0.2)]" whileHover={{ scale: 1.08 }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.2 }}>
              <h3 className="text-lg font-semibold text-[#2a1a0a] before:mr-2 before:text-lg before:content-['✓'] sm:text-xl">
                {t(text)}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] px-6 py-20 text-center sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
        <motion.h2 className="relative mb-4 text-3xl font-bold text-white sm:text-4xl" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          {t('beginYourSpiritualJourney')}
        </motion.h2>
        <p className="relative mx-auto mb-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">{t('discoverRituals')}</p>

        <motion.button
          className="relative inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-bold text-[#5a67d8] shadow-md transition hover:-translate-y-0.5 hover:bg-[#5a67d8] hover:text-white hover:shadow-xl"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/services')}
        >
          {t('exploreServices')} →
        </motion.button>
      </section>

    </div>
  );
};

export default About;
