// Frontend/src/components/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { authStorage } from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { analytics } from '../../utils/analytics';
import '../../styles/AdminLogin.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

      setError('Login failed. Please try again.');
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
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="logo">
            <img src="/icon.png" alt="PanditJi Logo" />
            <h1>PanditJi</h1>
          </div>
          <h2>Admin Portal</h2>
          <p>Sign in to manage your platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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

          <div className="form-group">
            <label htmlFor="password">Password</label>
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

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faLock} />
            {loading ? <LoadingSpinner size="small" /> : ' Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Email:</strong> admin@panditji.com</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
          <p className="security-note">
            <FontAwesomeIcon icon={faLock} /> Secure admin access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
