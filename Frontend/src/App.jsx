import React, { useState, useEffect } from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { analytics } from './utils/analytics';
import Header from './components/common/Header';
import Home from './pages/Home';
import Footer from './components/common/Footer.jsx';
import HelpWidget from './components/common/HelpWidget';
import Services from './pages/Services.jsx';
import FindPandit from './BookPandit/FindPandit.jsx';
import AdminPanel from './components/admin/AdminPanel.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import ErrorBoundary from "./components/ErrorBoundary";
import PanditPortal from './pages/PanditPortal.jsx';
import PanditLogin from './components/pandit/PanditLogin.jsx';
import UserLogin from './components/user/UserLogin';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import UserDashboard from './components/user/UserDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import { SocketProvider } from './context/SocketContext';
import ForgotPassword from './components/user/ForgotPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import CancellationPolicy from './pages/CancellationPolicy';
import DeleteAccount from './pages/DeleteAccount';
import DownloadApp from './pages/DownloadApp';
import { authStorage } from './api/apiClient';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PanditForgotPassword from './components/pandit/PanditForgotPassword';
import PanditResetPassword from './components/pandit/PanditResetPassword';
import JoinPandit from './pages/JoinPandit';
import AstroServices from "./pages/AstroServices";
import KundaliTool from './components/astro/KundaliTool.jsx';
import HoroscopeTool from './components/astro/HoroscopeTool.jsx';
import CompatibilityTool from './components/astro/CompatibilityTool.jsx';
import CompatibilityResult from './components/astro/CompatibilityResult.jsx';
import HoroscopeResult from './components/astro/HoroscopeResult.jsx';
import KundaliResult from './components/astro/KundaliResult.jsx';



// Component to conditionally show Header
const Layout = ({ children }) => {
  const location = useLocation();

  const hideHeaderRoutes = ['/admin', '/admin-login', '/pandit', '/pandit-login'];
  const shouldHideHeader = hideHeaderRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  const hideFooterRoutes = ['/admin', '/admin-login'];
  const shouldHideFooter = hideFooterRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {!shouldHideHeader && <Header />}
      <main className={shouldHideHeader ? 'full-width-main' : 'main-content'}>
        {children}
      </main>
      <HelpWidget />
      {!shouldHideFooter && <Footer />}
    </>
  );
};

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location]);

  return null;
}


const AdminRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const { token } = authStorage.getAuth('admin');
    const isAuthenticated = authStorage.isAuthenticated('admin');

    setIsValid(!!token && isAuthenticated);

    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return isValid ? children : <Navigate to="/admin-login" replace />;
};

// Pandit Route Protection
const PanditRoute = ({ children }) => {
  const { token } = authStorage.getAuth('pandit');
  return token ? children : <Navigate to="/pandit-login" replace />;
};

function App() {
  useEffect(() => {

  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="custom-toast-container"
          toastClassName="custom-toast"
        />


        <PageTracker />
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/find-pandit" element={<FindPandit />} />
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/cancellation-policy" element={<CancellationPolicy />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
              <Route path="/download-app" element={<DownloadApp />} />
              <Route path="/join-pandit" element={<JoinPandit />}/>
              <Route path="/astro-services" element={<AstroServices />}/>
              <Route path="/astro/kundali" element={<KundaliTool />}/>
              <Route path="/astro/kundali/result" element={<KundaliResult />}/>
              <Route path="/astro/horoscope" element={<HoroscopeTool />}/>
              <Route path="/astro/horoscope/result" element={<HoroscopeResult />}/>
              <Route path="/astro/compatibility" element={<CompatibilityTool />}/>
              <Route path="/astro/compatibility/result" element={<CompatibilityResult />}/>
              
              

              
              

              {/* Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } />
              <Route path="/user/forgot-password" element={<ForgotPassword />} />


              <Route path="/pandit-login" element={<PanditLogin />} />
              <Route path="/pandit" element={
                <PanditRoute>
                  <SocketProvider>
                    <PanditPortal />
                  </SocketProvider>
                </PanditRoute>
              } />
              <Route path="/pandit-forgot-password" element={<PanditForgotPassword />} />
              <Route path="/pandit-reset-password" element={<PanditResetPassword />} />

              <Route path="/user/dashboard" element={
                <ProtectedRoute role="user">
                  <UserDashboard />
                </ProtectedRoute>
              } />

              <Route path="/user" element={<Navigate to="/user/login" />} />

              <Route path="*" element={
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <h2>404 - Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                  <Link to="/">Go Home</Link>
                </div>
              } />
            </Routes>
          </Layout>
        </ErrorBoundary>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
