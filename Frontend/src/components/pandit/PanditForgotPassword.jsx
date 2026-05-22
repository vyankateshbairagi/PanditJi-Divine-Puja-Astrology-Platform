// frontend/src/components/pandit/PanditForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { buildUrl } from '../../config';
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
    <div className="pandit-login-container">
      <div className="pandit-login-card">
        <div className="login-header">
          <div className="logo">
            <img src="/icon.png" alt="PanditJi" />
            <h1>PanditJi</h1>
          </div>
          <h2>Forgot Password?</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}
        {message && <div className="login-success">✅ {message}</div>}

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Send Reset Link'}
            </button>

            <div className="login-footer">
              <Link to="/pandit-login">← Back to Login</Link>
            </div>
          </form>
        ) : (
          <div className="login-form">
            <div className="login-success" style={{ textAlign: 'center' }}>
              <p>✅ {message}</p>
              <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                Please check your email inbox (and spam folder) for the reset link.
                The link will expire in 1 hour.
              </p>
            </div>
            <div className="login-footer">
              <Link to="/pandit-login">← Back to Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanditForgotPassword;