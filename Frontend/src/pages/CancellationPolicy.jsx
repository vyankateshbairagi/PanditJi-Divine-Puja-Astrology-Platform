// frontend/src/pages/CancellationPolicy.jsx
import React from 'react';

const CancellationPolicy = () => {
  return (
    <div className="min-h-[calc(100vh-300px)] bg-[#fdf6ec] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-10">
        <h1 className="inline-block border-b-4 border-green-600 pb-2 text-3xl font-bold text-gray-800 sm:text-[32px]">Cancellation & Refund Policy</h1>
        <p className="mb-8 mt-3 text-sm italic text-gray-500">Last Updated: January 1, 2025</p>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">1. User Cancellation Policy</h2>
          
          <h3 className="mb-3 mt-5 text-lg font-semibold text-gray-600">1.1 Standard Cancellation</h3>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Cancellations made <strong>more than 24 hours</strong> before the scheduled puja: <strong>Full refund</strong></li>
            <li>Cancellations made <strong>less than 24 hours</strong> before the scheduled puja: <strong>No refund</strong></li>
            <li>Cancellations on the day of puja: <strong>No refund</strong></li>
          </ul>

          <h3 className="mb-3 mt-5 text-lg font-semibold text-gray-600">1.2 How to Cancel</h3>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Log in to your account</li>
            <li>Go to "My Bookings"</li>
            <li>Click "Cancel" on the relevant booking</li>
            <li>Confirm cancellation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">2. Pandit Cancellation Policy</h2>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>If a pandit cancels less than 12 hours before the puja: <strong>Full refund to user + Replacement pandit arranged</strong></li>
            <li>If a pandit cancels more than 12 hours before: <strong>Full refund + Alternative pandit offered</strong></li>
            <li>Repeated cancellations may result in pandit account suspension</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">3. Admin Cancellation</h2>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Admin can cancel any booking at any time (emergency situations)</li>
            <li>Full refund will be processed for admin-initiated cancellations</li>
            <li>Users will be notified via email and SMS</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">4. Refund Process</h2>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Refunds are processed within <strong>5-7 business days</strong></li>
            <li>Refunds are issued to the original payment method</li>
            <li>You will receive a confirmation email once refund is processed</li>
            <li>For cash payments, contact support for refund arrangements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">5. No-Show Policy</h2>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li><strong>User No-Show:</strong> If user is not present at the scheduled time, no refund will be provided</li>
            <li><strong>Pandit No-Show:</strong> If pandit does not arrive within 30 minutes, full refund + ₹200 compensation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">6. Force Majeure</h2>
          <p className="mb-4 leading-7 text-gray-600">In case of natural disasters, government restrictions, or unforeseen circumstances:</p>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Full refund will be provided</li>
            <li>Option to reschedule without additional charges</li>
            <li>No cancellation fees apply</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">7. Special Cases</h2>
          
          <h3 className="mb-3 mt-5 text-lg font-semibold text-gray-600">7.1 Medical Emergency</h3>
          <p className="mb-4 leading-7 text-gray-600">With valid medical certificate, cancellation can be made up to 2 hours before puja with 50% refund.</p>
          
          <h3 className="mb-3 mt-5 text-lg font-semibold text-gray-600">7.2 Wrong Booking</h3>
          <p className="mb-4 leading-7 text-gray-600">If you booked the wrong service, contact support within 1 hour for free modification.</p>
          
          <h3 className="mb-3 mt-5 text-lg font-semibold text-gray-600">7.3 Dissatisfaction with Service</h3>
          <p className="leading-7 text-gray-600">If you are unsatisfied, please submit a support ticket. We will investigate and may offer partial refund.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">8. How to Request a Refund</h2>
          <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-600 marker:text-green-600">
            <li>Go to "Contact Support" in your dashboard</li>
            <li>Select "Refund Request" as issue type</li>
            <li>Provide booking ID and reason</li>
            <li>Our team will review and respond within 48 hours</li>
          </ol>
        </section>

        <section className="mb-2">
          <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">9. Contact for Cancellation</h2>
          <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
            <li>Email: <a className="text-green-600 hover:underline" href="mailto:cancellations@panditji.com">cancellations@panditji.com</a></li>
            <li>Phone: +91 9373120370</li>
            <li>Support Ticket: Via User Dashboard</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CancellationPolicy;