// frontend/src/components/user/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { buildUrl } from '../../config';
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
      const response = await fetch(buildUrl('/user/forgot-password'), {
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
      const response = await fetch(buildUrl('/user/verify-reset-code'), {
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
      const response = await fetch(buildUrl('/user/reset-password'), {
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
      const response = await fetch(buildUrl('/user/forgot-password'), {
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
    <div className="auth-page forgot-page">
      <div className="auth-shell forgot-shell">
        <aside className="auth-hero forgot-hero" aria-hidden="true">
          <div className="auth-hero-content forgot-hero-content">
            <p className="auth-hero-kicker">Recover access</p>
            <h1 className="auth-hero-title">PanditJi</h1>
            <div className="auth-hero-divider">
              <span />
              <span className="auth-hero-star">✻</span>
              <span />
            </div>
            <p className="auth-hero-subtitle">Reset your account in a few quick steps</p>

            <div className="auth-hero-emblem-wrap forgot-hero-emblem-wrap">
              <img src="/icon.png" alt="PanditJi emblem" className="auth-hero-emblem" />
            </div>

            <div className="auth-hero-prayer">
              <span>Secure recovery for your account</span>
              <small>We will send a reset code to your registered email</small>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel forgot-form-panel">
          <div className="auth-form-card forgot-form-card">
            <div className="auth-card-header">
              <span className="auth-card-rule" />
              <h2>Forgot Password</h2>
              <span className="auth-card-rule" />
            </div>

            <p className="auth-card-subtitle">Reset your password in 3 simple steps</p>

            <div className="steps-indicator forgot-steps-indicator" aria-label="Password reset steps">
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

            {error && <div className="auth-error-message">⚠️ {error}</div>}
            {success && <div className="auth-success-message">✅ {success}</div>}

            {step === 1 && (
              <form onSubmit={handleSendCode} className="auth-form forgot-form">
                <div className="auth-field">
                  <label htmlFor="forgot-email">Email Address</label>
                  <div className="auth-input-shell">
                    <input
                      id="forgot-email"
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
                  {loading ? <LoadingSpinner size="small" /> : 'Send Reset Code'}
                </button>

                <div className="auth-divider forgot-inline-divider">
                  <span />
                  <span>or</span>
                  <span />
                </div>

                <div className="auth-switch-copy">
                  <Link to="/user/login" className="auth-switch-link">Back to Login</Link>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode} className="auth-form forgot-form">
                <div className="auth-field">
                  <label htmlFor="forgot-code">Verification Code</label>
                  <div className="auth-input-shell">
                    <input
                      id="forgot-code"
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      maxLength="6"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="otp-hint">Enter the 6-digit code sent to {email}</p>
                  {resendTimer > 0 && (
                    <div className="otp-hint">Resend available in {resendTimer}s</div>
                  )}
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <LoadingSpinner size="small" /> : 'Verify Code'}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  className="auth-secondary-submit"
                  disabled={resendTimer > 0 || loading}
                >
                  {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend Code'}
                </button>

                <div className="auth-switch-copy">
                  <button type="button" onClick={() => setStep(1)} className="auth-switch-link auth-inline-link-button">
                    Back to Email
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="auth-form forgot-form">
                <div className="auth-field">
                  <label htmlFor="forgot-new-password">New Password</label>
                  <div className="auth-input-shell">
                    <input
                      id="forgot-new-password"
                      type="password"
                      value={newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Min 6 characters"
                      required
                      disabled={loading}
                    />
                  </div>
                  {passwordStrength && (
                    <div className={`password-strength ${passwordStrength}`}></div>
                  )}
                  <p className="otp-hint">
                    {passwordStrength === 'weak' && '⚠️ Password is too weak'}
                    {passwordStrength === 'medium' && '👍 Getting better!'}
                    {passwordStrength === 'strong' && '✅ Strong password!'}
                  </p>
                </div>

                <div className="auth-field">
                  <label htmlFor="forgot-confirm-password">Confirm Password</label>
                  <div className="auth-input-shell">
                    <input
                      id="forgot-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <LoadingSpinner size="small" /> : 'Reset Password'}
                </button>

                <div className="auth-switch-copy">
                  <button type="button" onClick={() => setStep(2)} className="auth-switch-link auth-inline-link-button">
                    Back to Code
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;