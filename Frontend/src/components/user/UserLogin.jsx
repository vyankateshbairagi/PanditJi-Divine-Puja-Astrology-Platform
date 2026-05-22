// Frontend/src/components/user/UserAuth.jsx
import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { authStorage } from '../../api/apiClient';
import { toast } from 'react-toastify';
import '../../styles/UserAuth.css';
import 'boxicons/css/boxicons.min.css';

const UserLogin = () => {
  const [isActive, setIsActive] = useState(false);

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
  const [registerError, setRegisterError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const navigate = useNavigate();
  const { login } = useAuth();

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
  const handleBookingSuccess = (result) => {
    console.log("✅ Booking successful:", result);
    // Clear any pending booking data
    localStorage.removeItem('pendingBooking');
    if (onSuccess) onSuccess(result);
    if (onClose) onClose();
  };

  // Register Handlers
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
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

  const validateRegisterForm = (requireOtp = false) => {
    if (!registerData.name.trim()) {
      setRegisterError('Name is required');
      return false;
    }
    if (!registerData.email.trim()) {
      setRegisterError('Email is required');
      return false;
    }
    if (!/^\d{10}$/.test(registerData.phone)) {
      setRegisterError('Valid 10-digit phone number is required');
      return false;
    }
    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return false;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return false;
    }
    if (requireOtp && !/^\d{6}$/.test(registerData.otp)) {
      setRegisterError('Enter the 6-digit OTP sent to your email');
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm(false)) {
      return;
    }

    setOtpLoading(true);
    setRegisterError('');

    try {
      const { confirmPassword, otp, ...userData } = registerData;
      const result = await userApi.sendO
      tp(userData);

      if (result.success) {
        setOtpSent(true);
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm(true)) {
      return;
    }

    setRegisterLoading(true);
    setRegisterError('');

    try {
      const { confirmPassword, ...userData } = registerData;

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

  
  let otpButtonLabel = 'Send OTP';
  if (otpLoading) {
    otpButtonLabel = 'Sending OTP...';
  } else if (otpSent) {
    otpButtonLabel = 'Resend OTP';
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
      <div className={`auth-container ${isActive ? 'active' : ''}`}>

        {/* Login Form */}
        <div className="form-box login">
          <form onSubmit={handleLoginSubmit}>
            <h1>Welcome Back</h1>
            <p className="form-subtitle">Sign in to manage your bookings</p>

            {loginError && <div className="auth-error-message">⚠️ {loginError}</div>}

            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={loginCredentials.email}
                onChange={handleLoginChange}
                required
                disabled={loginLoading}
              />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginCredentials.password}
                onChange={handleLoginChange}
                required
                disabled={loginLoading}
              />
              <i className="bx bxs-lock-alt"></i>
            </div>

            <div className="forgot-link">
              <Link to="/user/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn" disabled={loginLoading}>
              {loginLoading ? <LoadingSpinner size="small" /> : 'Sign In'}
            </button>

            <div className="back-home">
              <a href="/">← Back to Home</a>
            </div>
          </form>
        </div>



        {/* Register Form */}
        <div className="form-box register">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Create Account</h1>
            <p className="form-subtitle">Join PanditJi to Book Puja Services</p>

            {registerError && <div className="auth-error-message">⚠️ {registerError}</div>}

            <div className="input-box">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                disabled={registerLoading}
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                disabled={registerLoading}
              />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={registerData.phone}
                onChange={handleRegisterChange}
                maxLength="10"
                required
                disabled={registerLoading || otpLoading}
              />
              <i className="bx bxs-phone"></i>
            </div>
            
            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                disabled={registerLoading}
              />
              <i className="bx bxs-lock-alt"></i>
            </div>



            <div className="input-box">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                required
                disabled={registerLoading || otpLoading}
              />
              <i className="bx bxs-lock-alt"></i>
            </div>

            {otpSent && (
              <div className="input-box">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit OTP"
                  value={registerData.otp}
                  onChange={handleRegisterChange}
                  maxLength="6"
                  inputMode="numeric"
                  required
                  disabled={registerLoading}
                />
                <i className="bx bxs-shield"></i>
              </div>
            )}

            <div className="otp-actions">
              <button type="button" className="btn otp-btn" onClick={handleSendOtp} disabled={otpLoading || registerLoading || resendCountdown > 0}>
                {otpButtonLabel}
              </button>
              {otpSent && (
                <p className="otp-hint">
                  {resendCountdown > 0 ? `You can resend OTP in ${resendCountdown}s` : 'OTP sent. Check your inbox.'}
                </p>
              )}
            </div>

            <button type="submit" className="btn" disabled={registerLoading}>
              {registerLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        </div>

        {/* Toggle Panel */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, User!</h1>
            <p>Don't have an account? Register now to Book Puja Services</p>
            <button className="btn register-btn" onClick={switchToRegister}>
              Register
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account? Sign in to manage your Bookings</p>
            <button className="btn login-btn" onClick={switchToLogin}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;