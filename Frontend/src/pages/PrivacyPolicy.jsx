// frontend/src/pages/PrivacyPolicy.jsx
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-[calc(100vh-300px)] bg-[#fdf6ec] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-10">
        <h1 className="inline-block border-b-4 border-green-600 pb-2 text-3xl font-bold text-gray-800 sm:text-[32px]">Privacy Policy</h1>
        <p className="mb-8 mt-3 text-sm italic text-gray-500">Last Updated: January 1, 2025</p>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">1. Information We Collect</h2>
          <p className="mb-4 leading-7 text-gray-600">At PanditJi, we collect the following types of information:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li><strong>Personal Information:</strong> Name, email address, phone number, address</li>
            <li><strong>Booking Information:</strong> Service details, date and time, pandit preferences</li>
            <li><strong>Payment Information:</strong> Transaction details (we do not store full payment credentials)</li>
            <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">2. How We Use Your Information</h2>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>To process and confirm your bookings</li>
            <li>To communicate with you about your bookings</li>
            <li>To improve our services and user experience</li>
            <li>To send you important updates and promotional offers (with your consent)</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">3. Information Sharing</h2>
          <p className="mb-4 leading-7 text-gray-600">We share your information only with:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li><strong>Pandits:</strong> To facilitate your booking (name, contact, address, service details)</li>
            <li><strong>Service Providers:</strong> For payment processing and email delivery</li>
            <li><strong>Legal Authorities:</strong> When required by law</li>
          </ul>
          <p className="leading-7 text-gray-600">We never sell your personal information to third parties.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">4. Data Security</h2>
          <p className="mb-4 leading-7 text-gray-600">We implement industry-standard security measures including:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>SSL/TLS encryption for data transmission</li>
            <li>Secure password hashing (bcrypt)</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">5. Your Rights</h2>
          <p className="mb-4 leading-7 text-gray-600">You have the right to:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
          </ul>
          <p className="leading-7 text-gray-600">To exercise these rights, contact us at <a className="text-green-600 hover:underline" href="mailto:privacy@panditji.com">privacy@panditji.com</a></p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">6. Cookies</h2>
          <p className="mb-4 leading-7 text-gray-600">We use cookies to:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Maintain your login session</li>
            <li>Remember your preferences</li>
            <li>Analyze site traffic</li>
          </ul>
          <p className="leading-7 text-gray-600">You can disable cookies in your browser settings.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">7. Children's Privacy</h2>
          <p className="leading-7 text-gray-600">Our services are not intended for children under 13. We do not knowingly collect information from children.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">8. Changes to This Policy</h2>
          <p className="leading-7 text-gray-600">We may update this Privacy Policy periodically. We will notify you of significant changes via email or website notice.</p>
        </section>

        <section className="mb-2">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">9. Contact Us</h2>
          <p className="mb-4 leading-7 text-gray-600">If you have questions about this Privacy Policy:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Email: <a className="text-green-600 hover:underline" href="mailto:privacy@panditji.com">privacy@panditji.com</a></li>
            <li>Phone: +91 9373120370</li>
            <li>Address: Pune, India</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;