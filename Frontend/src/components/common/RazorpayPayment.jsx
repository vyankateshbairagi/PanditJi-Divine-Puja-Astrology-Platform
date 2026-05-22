// frontend/src/components/common/RazorpayPayment.jsx - FIXED VERSION
import React, { useState } from 'react';
import API_CONFIG from '../../config';
import { authStorage } from '../../api/apiClient'; // ✅ FIX: Import authStorage instead of reading wrong key

const RazorpayPayment = ({ bookingId, totalAmount, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = API_CONFIG.BASE_URL;

  const getAuthToken = () => {
    // ✅ FIX: Was reading 'userToken' but authStorage saves under 'user_token'
    // Always use authStorage.getAuth() as the single source of truth
    const { token } = authStorage.getAuth('user');
    return token;
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const token = getAuthToken();

      if (!token) {
        alert('Please login again to complete payment');
        window.location.href = '/user/login';
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, totalAmount })
      });

      const orderData = await response.json();

      if (!orderData.success) {
        alert('Failed to create payment order: ' + (orderData.message || 'Unknown error'));
        setLoading(false);
        return;
      }

      // Load Razorpay script dynamically (only once)
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');

      const loadAndPay = () => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount, // ✅ FIXED
          currency: orderData.currency,
          name: 'PanditJi',
          description: `Booking ID: ${bookingId}`,
          order_id: orderData.orderId,

          handler: async (response) => {
            try {
              const { token } = authStorage.getAuth('user'); // ✅ refresh token

              const verifyRes = await fetch(`${API_BASE_URL}/payment/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  bookingId,
                  totalAmount
                })
              });

              if (!verifyRes.ok) throw new Error('Verification failed');

              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                alert('✅ Payment successful! Your booking is confirmed.');
                onSuccess?.();
              } else {
                throw new Error('Verification failed');
              }

            } catch (err) {
              console.error(err);
              alert('❌ Payment verification failed.');
              onFailure?.();
            } finally {
              setLoading(false);
            }
          },

          modal: {
            ondismiss: () => {
              setLoading(false);
              if (onFailure) onFailure();  // ← add this line
            }
          }
        };

        const razorpay = new window.Razorpay(options);

        // ✅ Handle failure
        razorpay.on('payment.failed', () => {
          alert('❌ Payment failed. Please try again.');
          onFailure?.();
          setLoading(false);
        });

        razorpay.open();
      };

      if (existingScript && window.Razorpay) {
        loadAndPay();
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = loadAndPay;
        script.onerror = () => {
          alert('Failed to load payment gateway. Please check your internet connection.');
          setLoading(false);
        };
        document.body.appendChild(script);
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      if (onFailure) onFailure();
      setLoading(false);
    }
  };

  const advanceAmount = totalAmount ? Math.round(totalAmount * 0.3) : 0;

  return (
    <button onClick={handlePayment} disabled={loading} className="payment-btn">
      {loading ? 'Processing...' : `Pay Advance ₹${advanceAmount}`}
    </button>
  );
};

export default RazorpayPayment;
