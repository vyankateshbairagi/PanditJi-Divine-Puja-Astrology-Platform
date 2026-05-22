import React from 'react';
import { Link } from 'react-router-dom';

const DownloadApp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50">
      <section aria-labelledby="download-app-title" className="w-full max-w-3xl p-10 bg-white/90 rounded-2xl shadow-xl border border-amber-100 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-sm">Coming Soon</div>
        <h1 id="download-app-title" className="text-4xl sm:text-5xl font-extrabold text-amber-900 leading-tight">Our mobile app is on the way</h1>
        <p className="mt-4 text-neutral-700 max-w-2xl mx-auto text-lg">We’re building a smoother experience for booking pujas, tracking updates, and staying connected on the go.</p>

        <div className="mt-8 flexjustify-center gap-4 flex-wrap">
          <Link to="/services" className="px-6 py-3 bg-amber-700 text-white rounded-lg font-semibold hover:shadow-lg transition">Explore Services</Link>
          <Link to="/contact" className="px-6 py-3 bg-white border border-amber-200 text-amber-800 rounded-lg font-semibold hover:shadow-sm transition">Contact Support</Link>
        </div>
      </section>
    </div>
  );
};

export default DownloadApp;