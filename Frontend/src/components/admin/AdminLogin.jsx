// Frontend/src/components/admin/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { authStorage } from '../../api/apiClient';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/UserAuth.css';
import '../../styles/AdminLogin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCircleCheck,
  faHouse,
  faLock,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('hide-help');
    return () => document.body.classList.remove('hide-help');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminApi.login(credentials);

      if (result.success && result.token) {

        authStorage.saveAuth('admin', result.token, result.user);

        if (onLogin) onLogin(result.user);
        navigate('/admin', { replace: true });

      } else {
        setError(result.message || 'Login failed - No token received');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      setError(error?.response?.data?.message || error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-page admin-auth-page">
      <div className="auth-shell admin-auth-shell">
        <section className="auth-hero admin-auth-hero">
          <div className="auth-hero-content">
            <div className="admin-auth-kicker">Admin Portal</div>
            <h1 className="auth-hero-title admin-auth-title">PanditJi</h1>
            <div className="auth-hero-divider">
              <span />
              <FontAwesomeIcon icon={faLock} />
              <span />
            </div>
            <p className="auth-hero-subtitle admin-auth-subtitle">
              Secure access for bookings, services, payouts, and platform operations.
            </p>

            <div className="auth-hero-emblem-wrap admin-auth-emblem-wrap">
              <img className="auth-hero-emblem admin-auth-emblem" src="/icon.png" alt="PanditJi emblem" />
            </div>

            <div className="admin-auth-highlights">
              <div className="admin-auth-highlight">
                <FontAwesomeIcon icon={faCircleCheck} /> Review and manage bookings
              </div>
              <div className="admin-auth-highlight">
                <FontAwesomeIcon icon={faCircleCheck} /> Update services and pandits
              </div>
              <div className="admin-auth-highlight">
                <FontAwesomeIcon icon={faCircleCheck} /> Monitor payments and activity
              </div>
            </div>
          </div>
        </section>

        <section className="auth-form-panel admin-auth-form-panel">
          <div className="auth-form-card admin-auth-card">
            <div className="auth-login-top-actions">
              <Link to="/" className="auth-home-button admin-auth-home-button">
                <FontAwesomeIcon icon={faHouse} />
                Back to Home
              </Link>
            </div>

            <div className="auth-card-header">
              <span className="auth-card-rule" />
              <h2>Admin Sign In</h2>
              <span className="auth-card-rule" />
            </div>
            <p className="auth-card-subtitle admin-auth-card-subtitle">
              Use your verified admin credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error-message admin-auth-error-message">
                  <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">Email Address <span className="auth-required">*</span></label>
                <div className="auth-input-shell">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@panditji.com"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password <span className="auth-required">*</span></label>
                <div className="auth-input-shell">
                  <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit admin-auth-submit" disabled={loading}>
                <FontAwesomeIcon icon={faArrowRight} />
                {loading ? <LoadingSpinner size="small" /> : 'Sign In'}
              </button>

              <p className="admin-auth-security-note">
                <FontAwesomeIcon icon={faLock} /> Secure admin access only
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
