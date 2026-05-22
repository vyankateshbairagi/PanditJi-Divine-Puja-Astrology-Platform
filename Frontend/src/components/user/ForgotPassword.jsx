// frontend/src/components/user/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/UserAuth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length >= 8 && /[!@#$%^&*]/.test(password)) return 'strong';
    return 'medium';
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setNewPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Reset code sent to your email!');
        setResendTimer(60);
        setStep(2);
        if (data.resetToken) {
          console.log('Development reset code:', data.resetToken);
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/user/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Code verified! Please enter your new password.');
        setStep(3);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Invalid reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
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
    
    try {
      const response = await fetch('http://localhost:5000/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Password reset successful! Please login with your new password.');
        navigate('/user/login');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('New reset code sent!');
        setResendTimer(60);
      }
    } catch (error) {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p>Reset your password in 3 simple steps</p>
        </div>
        
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span> Email
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span> Verify
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span> Reset
          </div>
        </div>
        
        {error && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}
        
        {step === 1 && (
          <form onSubmit={handleSendCode} className="auth-form">
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
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Send Reset Code'}
            </button>
            
            <div className="auth-footer">
              <Link to="/user/login">← Back to Login</Link>
            </div>
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="auth-form">
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                maxLength="6"
                required
                disabled={loading}
              />
              <small>Enter the 6-digit code sent to {email}</small>
              {resendTimer > 0 && (
                <div className="timer-text">Resend available in {resendTimer}s</div>
              )}
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Verify Code'}
            </button>
            
            <button
              type="button"
              onClick={handleResendCode}
              className="resend-btn"
              disabled={resendTimer > 0 || loading}
            >
              {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="link-btn"
            >
              ← Back to Email
            </button>
          </form>
        )}
        
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={handlePasswordChange}
                placeholder="Min 6 characters"
                required
                disabled={loading}
              />
              {passwordStrength && (
                <div className={`password-strength ${passwordStrength}`}></div>
              )}
              <small>
                {passwordStrength === 'weak' && '⚠️ Password is too weak'}
                {passwordStrength === 'medium' && '👍 Getting better!'}
                {passwordStrength === 'strong' && '✅ Strong password!'}
              </small>
            </div>
            
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <LoadingSpinner size="small" /> : 'Reset Password'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(2)}
              className="link-btn"
            >
              ← Back to Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;