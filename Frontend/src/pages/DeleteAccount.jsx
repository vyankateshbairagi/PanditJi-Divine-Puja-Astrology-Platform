// frontend/src/pages/DeleteAccount.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authStorage } from '../api/apiClient';
import { buildUrl } from '../config';

const DeleteAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [confirmation, setConfirmation] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmation !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      return;
    }

    if (!reason) {
      setError('Please select a reason for deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { token } = authStorage.getAuth('user');
      
      const response = await fetch(buildUrl('/user/delete-account'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        alert('Your account has been deleted successfully. We are sad to see you go!');
        logout();
        navigate('/');
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/user/login');
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-300px)] bg-[#fdf6ec] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-10">
        <h1 className="inline-block border-b-4 border-green-600 pb-2 text-3xl font-bold text-gray-800 sm:text-[32px]">Delete My Account</h1>
        <p className="mt-5 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-4 font-semibold text-amber-800">Warning: This action is permanent and cannot be undone!</p>

        {step === 1 && (
          <>
            <section className="mt-8">
              <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">What happens when you delete your account?</h2>
              <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
                <li>Your profile information will be permanently removed</li>
                <li>Your booking history will be anonymized</li>
                <li>You will lose access to all your bookings</li>
                <li>Your reviews and ratings will be anonymized</li>
                <li>Your past bookings with pandits will be preserved for their records</li>
                <li>Any pending refunds will still be processed</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">Before you delete your account, consider:</h2>
              <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-600 marker:text-green-600">
                <li>Download your data (coming soon)</li>
                <li>You can also deactivate temporarily instead of deleting</li>
                <li>Contact support if you're facing issues we can help with</li>
              </ul>
            </section>

            <button 
              className="mt-4 inline-flex rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-green-700"
              onClick={() => setStep(2)}
            >
              Continue to Account Deletion
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <section className="mt-8">
              <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">Why are you leaving us?</h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Not satisfied with service"
                    className="h-4 w-4 accent-green-600"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Not satisfied with service
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Too expensive"
                    className="h-4 w-4 accent-green-600"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Too expensive
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Found alternative platform"
                    className="h-4 w-4 accent-green-600"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Found alternative platform
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Privacy concerns"
                    className="h-4 w-4 accent-green-600"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Privacy concerns
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="No longer need services"
                    className="h-4 w-4 accent-green-600"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  No longer need services
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100">
                  <input 
                    type="radio" 
                    name="reason" 
                    value="Other"
                    className="h-4 w-4 accent-green-600"
                    onChange={(e) => setReason(e.target.value)}
                  />
                  Other
                </label>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 mt-6 text-2xl font-semibold text-gray-700">Confirm Deletion</h2>
              <p className="mb-4 leading-7 text-gray-600">Type <strong>DELETE</strong> in the box below to confirm:</p>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-base tracking-[2px] outline-none transition focus:border-green-600"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Type DELETE here"
              />
            </section>

            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button 
                className="rounded-xl bg-gray-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-gray-600"
                onClick={() => navigate('/user/dashboard')}
              >
                Cancel
              </button>
              <button 
                className="rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Permanently Delete My Account'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteAccount;