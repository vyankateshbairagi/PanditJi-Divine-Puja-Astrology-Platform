import React, { useState, useEffect } from 'react';
import PanditLogin from '../components/pandit/PanditLogin';
import PanditDashboard from '../components/pandit/PanditDashboard';
import { authStorage } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import '../styles/PanditDashboard.css';

const PanditPortal = () => {
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { token, data } = authStorage.getAuth('pandit');
    if (token && data) {
      setPandit(data);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authStorage.clearAuth('pandit');
    setPandit(null);
    navigate('/pandit-login');
  };

  if (loading) {
    return (
      <div className="pandit-portal-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!pandit) {
    // PanditRoute already guards this, but just in case
    navigate('/pandit-login');
    return null;
  }

  return <PanditDashboard pandit={pandit} onLogout={handleLogout} />;
};

export default PanditPortal;