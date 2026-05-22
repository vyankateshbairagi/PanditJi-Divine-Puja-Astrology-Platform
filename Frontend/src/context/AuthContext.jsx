import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { authStorage } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use a ref for the timer so it is never stale inside callbacks
  const logoutTimerRef = useRef(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  };

  const getTimeUntilExpiry = (token) => {
    if (!token) return 0;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      const remaining = exp * 1000 - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch {
      return 0;
    }
  };

  // ─── Auto-logout timer ───────────────────────────────────────────────────

  const clearAutoLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  // logout is defined with useCallback so it is stable and can be referenced
  // inside setupAutoLogout without creating circular dependencies
  const logout = useCallback((isAutoLogout = false) => {
    authStorage.clearAuth('user');
    setUser(null);
    clearAutoLogoutTimer();

    const message = isAutoLogout
      ? 'Your session has expired. Please login again.'
      : 'You have been logged out successfully.';

    if (isAutoLogout) {
      // Give React one tick to re-render before redirecting
      setTimeout(() => {
        alert(message);
        window.location.href = '/user/login';
      }, 0);
    }
  }, []);

  const setupAutoLogout = useCallback((token) => {
    clearAutoLogoutTimer();
    const ms = getTimeUntilExpiry(token);
    if (ms > 0) {
      logoutTimerRef.current = setTimeout(() => {
        logout(true);
      }, ms);
    }
  }, [logout]);

  // ─── FIX 1: Validate token on every page visibility change ───────────────
  // This is the ROOT CAUSE of the bug you reported.
  // When the user leaves the tab for 1-2 hours and comes back, the browser
  // fires the 'visibilitychange' event. We re-check the token at that moment.
  // If it expired while the tab was hidden, we log out immediately so React
  // state (user, isAuthenticated) matches localStorage — fixing the split
  // state where the header shows the user as logged in but they are not.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      const { token } = authStorage.getAuth('user');

      // Token present in state but expired in storage → force logout
      if (!token || isTokenExpired(token)) {
        const currentUser = user; // capture from closure
        if (currentUser) {
          // User was logged in but token is now expired
          logout(true);
        }
        return;
      }

      // Token is still valid — refresh the auto-logout timer because
      // setTimeout pauses/drifts while the tab is hidden, so the scheduled
      // logout may have fired late or not at all.
      setupAutoLogout(token);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, logout, setupAutoLogout]);

  // ─── FIX 2: Also re-validate when the window regains focus ──────────────
  // Covers the case where the user switches apps (not tabs) for a long time.
  useEffect(() => {
    const handleFocus = () => {
      const { token } = authStorage.getAuth('user');
      if (user && (!token || isTokenExpired(token))) {
        logout(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, logout]);

  // ─── FIX 3: Cross-tab logout sync ────────────────────────────────────────
  // If the user logs out in another tab, this tab's header still shows them
  // as logged in. Listening to the 'storage' event fixes this.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user_token' && e.newValue === null && user) {
        // Token was removed in another tab — clear state in this tab too
        setUser(null);
        clearAutoLogoutTimer();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // ─── Initial session restore ──────────────────────────────────────────────
  useEffect(() => {
    const { token, data } = authStorage.getAuth('user');

    if (token && data && !isTokenExpired(token)) {
      setUser(data);
      setupAutoLogout(token);
    } else if (token) {
      // Token exists but is expired — clean it up silently
      authStorage.clearAuth('user');
    }

    setLoading(false);

    return () => clearAutoLogoutTimer();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Login ────────────────────────────────────────────────────────────────
  const login = (token, userData) => {
    authStorage.saveAuth('user', token, userData);
    setUser(userData);
    setupAutoLogout(token);
  };

  // ─── Update user data ─────────────────────────────────────────────────────
  const updateUser = (updatedData) => {
    const newData = { ...user, ...updatedData };
    const { token } = authStorage.getAuth('user');
    if (token) {
      authStorage.saveAuth('user', token, newData);
      setUser(newData);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
