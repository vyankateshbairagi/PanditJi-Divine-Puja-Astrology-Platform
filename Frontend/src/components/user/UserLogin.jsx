import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { authStorage } from '../../api/apiClient';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCircleCheck,
  faCircleXmark,
  faEnvelope,
  faEye,
  faEyeSlash,
  faHouse,
  faLock,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/UserAuth.css';

const UserLogin = () => {
  const [isActive, setIsActive] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptPolicies, setAcceptPolicies] = useState(false);

  // Login State
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    otp: '',
    phone: '',
    password: '',
    confirmPassword: '',

  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerificationLoading, setOtpVerificationLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerificationError, setOtpVerificationError] = useState('');
  const [verifiedOtpValue, setVerifiedOtpValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    setIsActive(false);
    setOtpSent(false);
    setResendCountdown(0);
  }, []);

  const generateRegistrationPhone = () => {
    const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
    return `7${digits}`;
  };

  // Login Handlers
  const handleLoginChange = (e) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const result = await userApi.login(loginCredentials);

      if (result.success && result.token) {
        authStorage.saveAuth('user', result.token, result.customer);
        login(result.token, result.customer);

        // ✅ Check for pending booking
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
          // User will be redirected to booking page where form will restore data
          const bookingData = JSON.parse(pendingBooking);
          if (bookingData.service) {
            navigate('/services');
          } else if (bookingData.pandit) {
            navigate('/find-pandit');
          } else {
            navigate('/user/dashboard');
          }
        } else {
          const previousPage = localStorage.getItem('previousPage') || '/';
          localStorage.removeItem('previousPage');
          navigate(previousPage);
        }
      } else {
        setLoginError(result.message || 'Login failed');
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };
  // Register Handlers
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterData({
      ...registerData,
      [name]: value
    });

    if (name === 'otp') {
      setOtpVerified(false);
      setOtpVerificationError('');
    }

    if (name === 'name' || name === 'email' || name === 'phone') {
      setOtpVerified(false);
      setOtpVerificationError('');
      setVerifiedOtpValue('');
    }
  };

  useEffect(() => {
    if (!resendCountdown) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCountdown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const validateRegisterForm = (formData = registerData, requireOtp = false, requireVerifiedOtp = false) => {
    if (!formData.name.trim()) {
      setRegisterError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setRegisterError('Email is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setRegisterError('Valid 10-digit phone number is required');
      return false;
    }
    if (requireVerifiedOtp && !otpVerified) {
      setRegisterError('Please verify the OTP before registering');
      return false;
    }
    if (requireOtp && !/^\d{6}$/.test(formData.otp)) {
      setRegisterError('Enter the 6-digit OTP sent to your email');
      return false;
    }
    if (requireOtp && formData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return false;
    }
    if (requireOtp && formData.password !== formData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const phone = registerData.phone || generateRegistrationPhone();
    const otpPayload = { name: registerData.name, email: registerData.email, phone };

    if (!validateRegisterForm({ ...registerData, phone }, false, false)) {
      return;
    }

    if (!registerData.phone) {
      setRegisterData((prev) => ({ ...prev, phone }));
    }

    setOtpLoading(true);
    setRegisterError('');
    setOtpVerified(false);
    setOtpVerificationError('');
    setVerifiedOtpValue('');

    try {
      const result = await userApi.sendOtp(otpPayload);

      if (result.success) {
        setOtpSent(true);
        setRegisterData((prev) => ({ ...prev, otp: '' }));
        setResendCountdown(result.resendAfterSeconds || 30);
        toast.success(result.message || 'OTP sent successfully');
      } else {
        setRegisterError(result.message || 'Failed to send OTP');
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setRegisterError(message);
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (otpValue = registerData.otp) => {
    const otp = String(otpValue || '').trim();

    if (!otpSent || otp.length !== 6) {
      return;
    }

    const phone = registerData.phone || generateRegistrationPhone();

    setOtpVerificationLoading(true);
    setOtpVerificationError('');

    try {
      const result = await userApi.verifyOtp({
        name: registerData.name,
        email: registerData.email,
        phone,
        otp
      });

      if (result.success) {
        setOtpVerified(true);
        setVerifiedOtpValue(otp);
        setRegisterError('');
        setOtpVerificationError('');
        toast.success(result.message || 'OTP verified successfully');
      } else {
        setOtpVerified(false);
        setVerifiedOtpValue('');
        setOtpVerificationError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setOtpVerified(false);
      setVerifiedOtpValue('');
      setOtpVerificationError(message);
    } finally {
      setOtpVerificationLoading(false);
    }
  };

  useEffect(() => {
    if (!otpSent) {
      return undefined;
    }

    const otpValue = String(registerData.otp || '').trim();

    if (!otpValue) {
      setOtpVerified(false);
      setOtpVerificationError('');
      setVerifiedOtpValue('');
      return undefined;
    }

    if (otpValue === verifiedOtpValue && otpVerified) {
      return undefined;
    }

    if (!/^\d{6}$/.test(otpValue)) {
      setOtpVerified(false);
      setOtpVerificationError('');
      setVerifiedOtpValue('');
      return undefined;
    }

    const timer = setTimeout(() => {
      handleVerifyOtp(otpValue);
    }, 450);

    return () => clearTimeout(timer);
  }, [registerData.otp, otpSent, registerData.name, registerData.email, registerData.phone, otpVerified, verifiedOtpValue]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!acceptPolicies) {
      setRegisterError('Please accept the Terms and Conditions and Privacy Statement');
      return;
    }

    const phone = registerData.phone || generateRegistrationPhone();
    const registrationPayload = { ...registerData, phone };

    if (!validateRegisterForm(registrationPayload, true, true)) {
      return;
    }

    if (!registerData.phone) {
      setRegisterData((prev) => ({ ...prev, phone }));
    }

    setRegisterLoading(true);
    setRegisterError('');

    try {
      const { confirmPassword, ...userData } = registrationPayload;

      const result = await userApi.register(userData);

      if (result.success && result.token) {
        authStorage.saveAuth('user', result.token, result.customer);
        toast.success(result.message || 'Registration successful!');
        navigate('/user/dashboard');

      } else {
        setRegisterError(result.message || 'Registration failed');
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setRegisterError(message);
      toast.error(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  
  let otpButtonLabel = 'VERIFY OTP';
  if (otpLoading) {
    otpButtonLabel = 'Sending OTP...';
  } else if (otpSent) {
    otpButtonLabel = 'RESEND OTP';
  } else {
    otpButtonLabel = 'SEND OTP';
  }

  const switchToRegister = () => {
    setIsActive(true);
    setLoginError('');
    setRegisterError('');
  };

  const switchToLogin = () => {
    setIsActive(false);
    setLoginError('');
    setRegisterError('');
  };

  return (
    <div className="auth-page">
      <div className={`auth-shell ${isActive ? 'is-register' : 'is-login'}`}>
        <aside className="auth-hero" aria-hidden="true">
          <div className="auth-hero-glow auth-hero-glow-one" />
          <div className="auth-hero-glow auth-hero-glow-two" />
          <div className="auth-hero-corner auth-hero-corner-top" />
          <div className="auth-hero-corner auth-hero-corner-bottom" />

          <div className="auth-hero-content">
            <p className="auth-hero-kicker">Welcome to</p>
            <h1 className="auth-hero-title">PanditJi</h1>
            <div className="auth-hero-divider">
              <span />
              <span className="auth-hero-star">✻</span>
              <span />
            </div>
            <p className="auth-hero-subtitle">Bringing Traditions Closer to You</p>

            <div className="auth-hero-emblem-wrap">
              <img src="/icon.png" alt="PanditJi emblem" className="auth-hero-emblem" />
            </div>

            <div className="auth-hero-prayer">
              <span>धर्मो रक्षति रक्षितः</span>
              <small>हमारा उद्देश्य है आपको सही पंडित से जोड़ना</small>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-card">
            {!isActive ? (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="auth-login-top-actions">
                  <Link to="/" className="auth-home-button">
                    <FontAwesomeIcon icon={faHouse} />
                    Back to Home
                  </Link>
                </div>

                <div className="auth-card-header">
                  <span className="auth-card-rule" />
                  <h2>Login</h2>
                  <span className="auth-card-rule" />
                </div>

                <p className="auth-card-subtitle">Sign in to manage your bookings</p>

                {loginError && <div className="auth-error-message">⚠️ {loginError}</div>}

                <div className="auth-field">
                  <label htmlFor="login-email">Email</label>
                  <div className="auth-input-shell">
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      placeholder="Enter Your Email"
                      value={loginCredentials.email}
                      onChange={handleLoginChange}
                      required
                      disabled={loginLoading}
                    />
                    <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="login-password">Password</label>
                  <div className="auth-input-shell">
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter Your Password"
                      value={loginCredentials.password}
                      onChange={handleLoginChange}
                      required
                      disabled={loginLoading}
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowLoginPassword((value) => !value)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      <FontAwesomeIcon icon={showLoginPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="auth-checkline auth-checkline-single">
                  <Link to="/user/forgot-password" className="auth-link">
                    Forgot password?
                  </Link>
                </div>

                {/* Terms & Privacy checkbox removed from login form */}

                <button type="submit" className="auth-submit" disabled={loginLoading}>
                  {loginLoading ? <LoadingSpinner size="small" /> : <><FontAwesomeIcon icon={faLock} /> Sign In</>}
                </button>

                <button
                  type="button"
                  className="auth-pandit-link-button"
                  onClick={() => navigate('/pandit-login')}
                >
                  Login as Pandit
                </button>

                <div className="auth-divider">
                  <span />
                  <span>or</span>
                  <span />
                </div>

                <p className="auth-switch-copy">
                  Don&apos;t have an account?{' '}
                  <button type="button" className="auth-switch-link" onClick={switchToRegister}>
                    Sign Up Here
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="auth-card-header">
                  <span className="auth-card-rule" />
                  <h2>Sign Up</h2>
                  <span className="auth-card-rule" />
                </div>

                <p className="auth-card-subtitle">Create your PanditJi account</p>

                {registerError && <div className="auth-error-message">⚠️ {registerError}</div>}

                <div className="auth-field">
                  <label htmlFor="register-name">Full Name <span className="auth-required">*</span></label>
                  <div className="auth-input-shell">
                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      placeholder="Enter Your Name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                      disabled={registerLoading}
                    />
                    <FontAwesomeIcon icon={faUser} className="auth-input-icon" />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="register-email">Email Address <span className="auth-required">*</span></label>
                  <div className="auth-inline-field">
                    <div className="auth-input-shell auth-input-shell-inline">
                      <input
                        id="register-email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                        disabled={registerLoading}
                      />
                      <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                    </div>
                    <button
                      type="button"
                      className="auth-inline-cta"
                      onClick={handleSendOtp}
                      disabled={otpLoading || registerLoading || resendCountdown > 0}
                    >
                      {otpButtonLabel}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="auth-field auth-otp-field">
                    <label htmlFor="register-otp">OTP <span className="auth-required">*</span></label>
                    <div className="auth-input-shell auth-otp-shell">
                      <input
                        id="register-otp"
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        value={registerData.otp}
                        onChange={handleRegisterChange}
                        maxLength="6"
                        inputMode="numeric"
                        required
                        disabled={registerLoading || otpVerificationLoading}
                      />
                      <FontAwesomeIcon
                        icon={otpVerificationLoading ? faLock : otpVerified ? faCircleCheck : faCircleXmark}
                        className={`auth-otp-status ${otpVerified ? 'verified' : otpVerificationError ? 'invalid' : ''}`}
                        spin={otpVerificationLoading}
                      />
                    </div>
                    {otpVerificationError && <p className="auth-otp-note auth-otp-note-error">{otpVerificationError}</p>}
                    {!otpVerificationError && !otpVerified && otpSent && (
                      <p className="auth-otp-note">Enter the OTP sent to your email to unlock the password fields.</p>
                    )}
                    {otpVerified && <p className="auth-otp-note auth-otp-note-success">OTP verified successfully</p>}
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="register-password">Password <span className="auth-required">*</span></label>
                  <div className="auth-input-shell">
                    <input
                      id="register-password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      disabled={registerLoading || !otpVerified}
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowRegisterPassword((value) => !value)}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      disabled={!otpVerified || registerLoading}
                    >
                      <FontAwesomeIcon icon={showRegisterPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="register-confirm-password">Confirm Password <span className="auth-required">*</span></label>
                  <div className="auth-input-shell">
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                      disabled={registerLoading || otpLoading || !otpVerified}
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        disabled={!otpVerified || registerLoading}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <label className="auth-policy">
                  <input
                    type="checkbox"
                    checked={acceptPolicies}
                    onChange={(e) => setAcceptPolicies(e.target.checked)}
                      disabled={!otpVerified}
                  />
                  <span>
                    I agree to the <Link to="/terms-conditions">Terms and Conditions</Link> and{' '}
                    <Link to="/privacy-policy">Privacy Statement</Link>
                  </span>
                </label>

                  <button type="submit" className="auth-submit" disabled={registerLoading || !otpVerified}>
                  {registerLoading ? 'Creating Account...' : 'SIGN UP'}
                </button>

                <p className="auth-switch-copy">
                  Already have an account?{' '}
                  <button type="button" className="auth-switch-link" onClick={switchToLogin}>
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserLogin;