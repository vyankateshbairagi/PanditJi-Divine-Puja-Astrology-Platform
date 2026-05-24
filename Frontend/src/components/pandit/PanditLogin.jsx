// Frontend/src/components/pandit/PanditLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { panditApi } from '../../api/panditApi';
import { authStorage } from '../../api/apiClient';
import LoadingSpinner from '../common/LoadingSpinner';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faLock } from "@fortawesome/free-solid-svg-icons";
import '../../styles/UserAuth.css';
import '../../styles/PanditLogin.css';

const PanditLogin = ({ onLogin }) => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Pandit login attempt...');

      // Clear previous sessions
      authStorage.clearAuth('admin');
      authStorage.clearAuth('user');
      authStorage.clearAuth('pandit');

      const result = await panditApi.login(credentials);
      console.log('✅ Login response:', result);

      if (result.success && result.token) {
        console.log('🎯 Login success');

        // Verify the save worked
        const { token: savedToken, data: savedData } = authStorage.getAuth('pandit');
        console.log('🔍 Verification - Token saved:', !!savedToken);
        console.log('🔍 Verification - Data saved:', !!savedData);

        if (savedToken && savedData) {
          console.log('✅ Storage verified, redirecting...');
          
          // Use window.location for guaranteed redirect
          window.location.href = '/pandit';
        } else {
          console.error('❌ Storage verification failed');
          setError('Login failed - storage error');
          setLoading(false);
        }

      } else {
        setError(result.message || 'Invalid credentials');
        setLoading(false);
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page pandit-page">
      <div className="auth-shell pandit-shell">
        <aside className="auth-hero pandit-hero" aria-hidden="true">
          <div className="auth-hero-content pandit-hero-content">
            <p className="auth-hero-kicker">Pandit Portal</p>
            <h1 className="auth-hero-title">PanditJi</h1>
            <div className="auth-hero-divider">
              <span />
              <span className="auth-hero-star">✻</span>
              <span />
            </div>
            <p className="auth-hero-subtitle">Warm, secure access for verified pandits</p>

            <div className="auth-hero-emblem-wrap pandit-hero-emblem-wrap">
              <img src="/images/pandit.png" alt="Pandit illustration" className="auth-hero-emblem pandit-hero-emblem" />
            </div>

            <div className="auth-hero-prayer pandit-hero-note">
              <span>Manage bookings with confidence</span>
              <small>Official login for approved pandit accounts</small>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel pandit-form-panel">
          <div className="auth-form-card pandit-form-card">
            <div className="pandit-back-row">
              <Link to="/user/login" className="pandit-back-button">
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to User Login
              </Link>
            </div>

            <div className="auth-card-header">
              <span className="auth-card-rule" />
              <h2>Pandit Login</h2>
              <span className="auth-card-rule" />
            </div>

            <p className="auth-card-subtitle">Sign in to manage your bookings and portal activity</p>

            {error && (
              <div className="auth-error-message">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form pandit-login-form">
              <div className="auth-field">
                <label htmlFor="pandit-username">Username</label>
                <div className="auth-input-shell">
                  <input
                    id="pandit-username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({ ...credentials, username: e.target.value })
                    }
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="pandit-password">Password</label>
                <div className="auth-input-shell">
                  <input
                    id="pandit-password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="auth-checkline auth-checkline-single pandit-forgot-row">
                <Link to="/pandit-forgot-password" className="auth-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                <FontAwesomeIcon icon={faLock} />
                {loading ? <LoadingSpinner size="small" /> : ' Sign In'}
              </button>

              <div className="pandit-support-note">
                <span>Need portal access?</span>
                <Link to="/contact">Contact admin</Link>
              </div>

              <p className="pandit-security-note">
                <FontAwesomeIcon icon={faLock} /> Secure pandit access only
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PanditLogin;