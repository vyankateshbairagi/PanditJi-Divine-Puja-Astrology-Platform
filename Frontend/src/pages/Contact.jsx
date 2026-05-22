import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-x-hidden bg-[#fdf6ec] text-[#2a1a0a]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(212,162,76,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(143,91,19,0.05)_0%,transparent_50%)]" />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] px-6 py-20 text-center sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        <motion.h1 className="relative mx-auto mb-4 max-w-4xl bg-[linear-gradient(135deg,#fff,rgba(255,255,255,0.8))] bg-clip-text text-4xl font-extrabold tracking-[-0.02em] text-transparent drop-shadow-sm sm:text-5xl lg:text-6xl" initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}>
          {t('getInTouch')}
        </motion.h1>
        <p className="relative mx-auto max-w-2xl text-base leading-7 text-white/90 sm:text-lg">{t('contactHelp')}</p>
      </section>

      {/* MAIN */}
      <section className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 px-6 py-16 sm:py-20">

        {/* FORM */}
        <motion.div className="min-w-[300px] flex-1 rounded-2xl border border-[rgba(212,162,76,0.2)] bg-white/70 p-8 shadow-md backdrop-blur-md transition hover:border-[rgba(212,162,76,0.4)] hover:bg-white/90 hover:shadow-[0_0_20px_rgba(212,162,76,0.2)]" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}>
          <h2 className="mb-6 inline-block bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] bg-clip-text text-2xl font-bold text-transparent after:mt-2 after:block after:h-[3px] after:w-12 after:rounded-full after:bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)]">{t('sendAMessage')}</h2>

          <input type="text" placeholder={t('yourName')} className="mb-4 w-full rounded-lg border border-[rgba(212,162,76,0.3)] bg-white/80 px-4 py-3 text-base text-[#2a1a0a] outline-none transition placeholder:text-[#8b6f56] focus:border-[#667eea] focus:ring-4 focus:ring-[rgba(102,126,234,0.15)]" />
          <input type="email" placeholder={t('yourEmail')} className="mb-4 w-full rounded-lg border border-[rgba(212,162,76,0.3)] bg-white/80 px-4 py-3 text-base text-[#2a1a0a] outline-none transition placeholder:text-[#8b6f56] focus:border-[#667eea] focus:ring-4 focus:ring-[rgba(102,126,234,0.15)]" />
          <textarea placeholder={t('yourMessage')} rows="5" className="mb-4 w-full resize-y rounded-lg border border-[rgba(212,162,76,0.3)] bg-white/80 px-4 py-3 text-base text-[#2a1a0a] outline-none transition placeholder:text-[#8b6f56] focus:border-[#667eea] focus:ring-4 focus:ring-[rgba(102,126,234,0.15)]" />

          <button className="mx-auto mt-2 inline-flex w-full max-w-xs items-center justify-center rounded-full bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] px-6 py-3 text-base font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">{t('sendMessage')}</button>
        </motion.div>

        {/* INFO */}
        <motion.div className="min-w-[280px] flex-1 rounded-2xl border border-[rgba(212,162,76,0.2)] bg-white/70 p-8 text-center shadow-md backdrop-blur-md transition hover:border-[rgba(212,162,76,0.4)] hover:bg-white/90 hover:shadow-[0_0_20px_rgba(212,162,76,0.2)]" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}>
          <h2 className="mb-6 inline-block bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)] bg-clip-text text-2xl font-bold text-transparent after:mt-2 after:block after:h-[3px] after:w-12 after:rounded-full after:bg-[linear-gradient(135deg,#836348_0%,#471f05_100%)]">{t('contactInfo')}</h2>

          <p className="my-4 flex items-center justify-center gap-3 text-base text-[#4a3520] transition hover:translate-x-1 hover:text-[#2a1a0a]">+91 9373120370</p>
          <p className="my-4 flex items-center justify-center gap-3 text-base text-[#4a3520] transition hover:translate-x-1 hover:text-[#2a1a0a]">info@panditji.com</p>
          <p className="my-4 flex items-center justify-center gap-3 text-base text-[#4a3520] transition hover:translate-x-1 hover:text-[#2a1a0a]">Pune, India</p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
           <a href="#" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-[rgba(212,162,76,0.2)] bg-[rgba(212,162,76,0.1)] px-5 py-2 font-medium text-[#4a3520] transition hover:-translate-y-1 hover:bg-[#1877f2] hover:text-white">
                           <FontAwesomeIcon icon={faFacebookF} />
                         </a>
           
                         <a href="#" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-[rgba(212,162,76,0.2)] bg-[rgba(212,162,76,0.1)] px-5 py-2 font-medium text-[#4a3520] transition hover:-translate-y-1 hover:bg-[linear-gradient(135deg,#f09433,#d62976,#962fbf)] hover:text-white">
                           <FontAwesomeIcon icon={faTwitter} />
                         </a>
           
                         <a href="https://instagram.com/bhushan_0919" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-[rgba(212,162,76,0.2)] bg-[rgba(212,162,76,0.1)] px-5 py-2 font-medium text-[#4a3520] transition hover:-translate-y-1 hover:bg-[linear-gradient(135deg,#f09433,#d62976,#962fbf)] hover:text-white">
                           <FontAwesomeIcon icon={faInstagram} />
                         </a>
           
                         <a href="https://youtube.com/@panditjiIndia" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-[rgba(212,162,76,0.2)] bg-[rgba(212,162,76,0.1)] px-5 py-2 font-medium text-[#4a3520] transition hover:-translate-y-1 hover:bg-[#ff0000] hover:text-white">
                           <FontAwesomeIcon icon={faYoutube} />
                         </a>
          </div>
        </motion.div>

      </section>

      {/* MAP */}
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
        <iframe
          src="https://maps.google.com/maps?q=pune&t=&z=13&ie=UTF8&iwloc=&output=embed"
          title="map"
          className="h-[350px] w-full rounded-2xl border border-white/10"
        ></iframe>
      </section>

    </div>
  );
};

export default Contact;

