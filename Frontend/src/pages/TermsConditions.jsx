// frontend/src/pages/TermsConditions.jsx
import React from 'react';

const TermsConditions = () => {
  return (
    <div className="min-h-[calc(100vh-300px)] bg-[#fdf6ec] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-10">
        <h1 className="inline-block border-b-4 border-green-600 pb-2 text-3xl font-bold text-gray-800 sm:text-[32px]">Terms & Conditions</h1>
        <p className="mb-8 mt-3 text-sm italic text-gray-500">Last Updated: January 1, 2025</p>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">1. Acceptance of Terms</h2>
          <p className="leading-7 text-gray-600">By accessing or using PanditJi's website and services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">2. Services Description</h2>
          <p className="leading-7 text-gray-600">PanditJi provides an online platform connecting users with pandits for religious ceremonies and puja services. We facilitate bookings but are not responsible for the actual performance of services.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">3. User Accounts</h2>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>You must be at least 18 years old to use our services</li>
            <li>You are responsible for maintaining account confidentiality</li>
            <li>You agree to provide accurate and complete information</li>
            <li>You are responsible for all activities under your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">4. Booking and Payments</h2>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Bookings are confirmed only after payment confirmation</li>
            <li>Prices are subject to change without notice</li>
            <li>We reserve the right to refuse or cancel bookings</li>
            <li>Payment processing is handled by secure third-party providers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">5. User Responsibilities</h2>
          <p className="mb-4 leading-7 text-gray-600">You agree to:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Provide accurate booking information</li>
            <li>Be present at the scheduled time and location</li>
            <li>Provide necessary arrangements for the puja</li>
            <li>Treat pandits with respect</li>
            <li>Not use the platform for any unlawful purpose</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">6. Pandit Responsibilities</h2>
          <p className="mb-4 leading-7 text-gray-600">Pandits agree to:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Perform services with dedication and professionalism</li>
            <li>Arrive on time at the scheduled location</li>
            <li>Maintain respectful conduct</li>
            <li>Follow all religious protocols and customs</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">7. Cancellation and Refunds</h2>
          <p className="leading-7 text-gray-600">Please refer to our <a className="text-green-600 hover:underline" href="/cancellation-policy">Cancellation Policy</a> for detailed information.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">8. Limitation of Liability</h2>
          <p className="mb-4 leading-7 text-gray-600">PanditJi is not liable for:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Any indirect, incidental, or consequential damages</li>
            <li>Service quality provided by pandits</li>
            <li>Technical issues beyond our control</li>
            <li>Losses resulting from unauthorized account access</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">9. Intellectual Property</h2>
          <p className="leading-7 text-gray-600">All content on this website, including logos, text, graphics, and software, is the property of PanditJi and protected by copyright laws.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">10. Termination</h2>
          <p className="leading-7 text-gray-600">We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse our services.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">11. Governing Law</h2>
          <p className="leading-7 text-gray-600">These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Pune, India.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">12. Changes to Terms</h2>
          <p className="leading-7 text-gray-600">We may modify these terms at any time. Continued use of our services constitutes acceptance of modified terms.</p>
        </section>

        <section className="mb-2">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">13. Contact Information</h2>
          <p className="mb-4 leading-7 text-gray-600">For questions about these terms:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Email: <a className="text-green-600 hover:underline" href="mailto:legal@panditji.com">legal@panditji.com</a></li>
            <li>Phone: +91 9373120370</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsConditions;