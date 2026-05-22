// frontend/src/pages/JoinPandit.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildUrl } from '../config';
import { useLanguage } from '../context/LanguageContext';

function JoinPandit() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [charCount, setCharCount] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    qualification: '',
    pujaTypes: '',
    experience: '',
    aadhar: ''
  });

  const handleChange = (e) => {
    let value = e.target.value;

    // Validate mobile number - only numbers, max 10 digits
    if (e.target.name === 'mobile') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    // Validate Aadhar - only numbers, max 12 digits
    if (e.target.name === 'aadhar') {
      value = value.replace(/\D/g, '').slice(0, 12);
    }
    if (e.target.name === 'pujaTypes') {
      setCharCount(e.target.value.length);
    }

    // Validate experience - only numbers, min 0, max 50
    if (e.target.name === 'experience') {
      value = value.replace(/\D/g, '');
      if (parseInt(value) > 50) value = 50;
    }


    setFormData({
      ...formData,
      [e.target.name]: value
    });

    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name.trim()) {
      setError(t('fullNameRequired'));
      return false;
    }

    if (formData.name.length < 2) {
      setError(t('nameTooShort'));
      return false;
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError(t('invalidMobile'));
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t('invalidEmail'));
      return false;
    }

    // Qualification validation
    if (!formData.qualification.trim()) {
      setError(t('qualificationRequired'));
      return false;
    }

    // Puja types validation
    if (!formData.pujaTypes.trim()) {
      setError(t('pujaTypesRequired'));
      return false;
    }

    // Experience validation
    if (!formData.experience) {
      setError(t('experienceRequired'));
      return false;
    }

    const expNum = parseInt(formData.experience);
    if (isNaN(expNum) || expNum < 0 || expNum > 50) {
      setError(t('experienceValid'));
      return false;
    }

    // Aadhar validation
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(formData.aadhar)) {
      setError(t('invalidAadhar'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(buildUrl('/application/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        // Reset form
        setFormData({
          name: '',
          mobile: '',
          email: '',
          qualification: '',
          pujaTypes: '',
          experience: '',
          aadhar: ''
        });

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(data.message || t('submissionFailed'));
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[linear-gradient(135deg,#f5ede0_0%,#ede0cc_100%)] px-4 py-16 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]" />
      <div className="relative z-10 w-full max-w-[580px] rounded-[24px] bg-white p-6 shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:shadow-[0_40px_70px_rgba(0,0,0,0.25)] sm:p-10">
        <h2 className="mb-2 text-center text-3xl font-bold text-transparent bg-clip-text bg-[linear-gradient(135deg,#8f5b13_0%,#c47a1e_100%)] sm:text-[32px]">{t('joinAsPandit')}</h2>
        <p className="mb-8 text-center text-sm leading-6 text-gray-600">{t('joinPanditIntro')}</p>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border-l-4 border-[#dc3545] bg-[linear-gradient(135deg,#f8d7da_0%,#f5c6cb_100%)] px-4 py-3 text-sm text-[#721c24]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border-l-4 border-[#28a745] bg-[linear-gradient(135deg,#d4edda_0%,#c3e6cb_100%)] px-4 py-3 text-sm text-[#155724]">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder={t('yourName') + ' *'}
            value={formData.name}
            className={`w-full rounded-xl border bg-[#fafafa] px-4 py-3 text-[15px] outline-none transition placeholder:text-gray-500 focus:border-[#667eea] focus:bg-white focus:ring-4 focus:ring-[rgba(102,126,234,0.1)] ${formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile) ? 'border-[#dc3545] bg-[#fff8f8]' : formData.mobile && /^[6-9]\d{9}$/.test(formData.mobile) ? 'border-[#28a745] bg-[#f8fff8]' : 'border-[#e0e0e0]'}`}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile) && (
            <span className="block text-xs text-gray-500">{t('invalidMobile')}</span>
          )}

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number * (10-digit)"
            value={formData.mobile}
            onChange={handleChange}
            required
            disabled={loading}
            maxLength="10"
            className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[15px] outline-none transition placeholder:text-gray-500 focus:border-[#667eea] focus:bg-white focus:ring-4 focus:ring-[rgba(102,126,234,0.1)]"
          />

          <input
            type="email"
            name="email"
            placeholder={t('yourEmail') + ' *'}
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[15px] outline-none transition placeholder:text-gray-500 focus:border-[#667eea] focus:bg-white focus:ring-4 focus:ring-[rgba(102,126,234,0.1)]"
          />

          <input
            type="text"
            name="qualification"
            placeholder="Qualification *"
            value={formData.qualification}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[15px] outline-none transition placeholder:text-gray-500 focus:border-[#667eea] focus:bg-white focus:ring-4 focus:ring-[rgba(102,126,234,0.1)]"
          />

          <textarea
            name="pujaTypes"
            placeholder="Types of Puja you can perform * (e.g., Satya Narayan, Ganesh Puja, etc.)"
            value={formData.pujaTypes}
            onChange={handleChange}
            required
            disabled={loading}
            rows="3"
            maxLength="500"
            className="w-full min-h-[100px] rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[15px] outline-none transition placeholder:text-gray-500 focus:border-[#667eea] focus:bg-white focus:ring-4 focus:ring-[rgba(102,126,234,0.1)]"
          />
          <div className="text-right text-xs text-gray-500">{charCount}/500 characters</div>

          <input
            type="number"
            name="experience"
            placeholder="Years of Experience *"
            value={formData.experience}
            onChange={handleChange}
            required
            disabled={loading}
            min="0"
            max="50"
            className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[15px] outline-none transition placeholder:text-gray-500 focus:border-[#667eea] focus:bg-white focus:ring-4 focus:ring-[rgba(102,126,234,0.1)]"
          />

          <input
            type="text"
            name="aadhar"
            placeholder="Aadhar Number * (12-digit)"
            value={formData.aadhar}
            onChange={handleChange}
            required
            disabled={loading}
            maxLength="12"
            className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[15px] outline-none transition placeholder:text-gray-500 focus:border-[#667eea] focus:bg-white focus:ring-4 focus:ring-[rgba(102,126,234,0.1)]"
          />

          <button type="submit" disabled={loading} className="mt-2 w-full rounded-xl bg-[linear-gradient(135deg,#8f5b13_0%,#c47a1e_100%)] px-4 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(102,126,234,0.4)] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? t('submitting') : t('submitApplication')}
          </button>
        </form>

        <p className="mt-6 border-t border-[#eee] pt-4 text-center text-xs leading-6 text-[#999]">
          {t('applicationNote')}
        </p>
      </div>
    </div>
  );
}

export default JoinPandit;