// frontend/src/components/pandit/PanditResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { buildUrl } from '../../config';
import '../../styles/PanditLogin.css';

const PanditResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(buildUrl('/pandit/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || 'Password reset successfully!');
        setTimeout(() => {
          navigate('/pandit-login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
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
          <h2>Reset Password</h2>
          <p>Enter your new password</p>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}
        
        {message && (
          <div className="login-success">
            ✅ {message}
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              Redirecting to login page...
            </p>
          </div>
        )}

        {!message && tokenValid && (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Reset Password'}
            </button>

            <div className="login-footer">
              <Link to="/pandit-login">← Back to Login</Link>
            </div>
          </form>
        )}
        
        {!tokenValid && (
          <div className="login-footer">
            <Link to="/pandit-forgot-password">Request New Reset Link</Link>
            <br />
            <br />
            <Link to="/pandit-login">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanditResetPassword;