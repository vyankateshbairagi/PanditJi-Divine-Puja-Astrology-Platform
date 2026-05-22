// frontend/src/components/auth/ProtectedRoute.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { authStorage } from '../../api/apiClient';

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
};


const ProtectedRoute = ({ children, role = 'user' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated: authIsAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);

      let token, userData;

      switch (role) {
        case 'user':
          const auth = authStorage.getAuth('user');
          token = auth.token;
          userData = auth.data;

          if (token && userData && isTokenValid(token)) {
            setIsAuthenticated(true);
          } else {
            navigate('/user/login', { replace: true });
          }
          break;
        case 'admin':
          token = sessionStorage.getItem('adminToken');
          userData = sessionStorage.getItem('adminUser');
          if (token && userData) {
            setIsAuthenticated(true);
          } else {
            navigate('/admin-login', { replace: true });
          }
          break;

        case 'pandit':
          token = localStorage.getItem('panditToken');
          userData = localStorage.getItem('panditData');
          if (token && userData) {
            setIsAuthenticated(true);
          } else {
            navigate('/pandit-login', { replace: true });
          }
          break;
      }

      setLoading(false);
    };

    checkAuth();
  }, [role, navigate]);


  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;