// frontend/src/components/pandit/PanditForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { buildUrl } from '../../config';
import '../../styles/UserAuth.css';
import '../../styles/PanditLogin.css';

const PanditForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(buildUrl('/pandit/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        setMessage(data.message || 'Password reset link sent to your email!');
      } else {
        setError(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page pandit-page pandit-forgot-page">
      <div className="auth-shell pandit-shell pandit-forgot-shell">
        <aside className="auth-hero pandit-hero" aria-hidden="true">
          <div className="auth-hero-content pandit-hero-content">
            <p className="auth-hero-kicker">Pandit Recovery</p>
            <h1 className="auth-hero-title">PanditJi</h1>
            <div className="auth-hero-divider">
              <span />
              <span className="auth-hero-star">✻</span>
              <span />
            </div>
            <p className="auth-hero-subtitle">Request a secure reset link for your portal</p>

            <div className="auth-hero-emblem-wrap pandit-hero-emblem-wrap">
              <img src="/images/pandit.png" alt="Pandit illustration" className="auth-hero-emblem pandit-hero-emblem" />
            </div>

            <div className="auth-hero-prayer pandit-hero-note">
              <span>Recover access safely</span>
              <small>We’ll send the reset link to your registered email</small>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel pandit-form-panel">
          <div className="auth-form-card pandit-form-card pandit-forgot-card">
            <div className="pandit-back-row">
              <Link to="/pandit-login" className="pandit-back-button">
                ← Back to Login
              </Link>
            </div>

            <div className="auth-card-header">
              <span className="auth-card-rule" />
              <h2>Forgot Password?</h2>
              <span className="auth-card-rule" />
            </div>

            <p className="auth-card-subtitle">Enter your email to receive a password reset link</p>

            {error && <div className="auth-error-message">⚠️ {error}</div>}

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="auth-form pandit-login-form">
                <div className="auth-field">
                  <label htmlFor="pandit-forgot-email">Email Address</label>
                  <div className="auth-input-shell">
                    <input
                      id="pandit-forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <LoadingSpinner size="small" /> : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="pandit-reset-success">
                <div className="auth-success-message">
                  <p>✅ {message}</p>
                  <p className="pandit-reset-note">
                    Please check your email inbox and spam folder for the reset link. The link will expire in 1 hour.
                  </p>
                </div>
                <div className="pandit-support-note pandit-reset-footer">
                  <span>Need help finding the email?</span>
                  <Link to="/contact">Contact admin</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PanditForgotPassword;