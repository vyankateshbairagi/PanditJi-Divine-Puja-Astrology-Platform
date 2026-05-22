// frontend/src/components/common/Skeleton.jsx
import React from 'react';
import '../../styles/Skeleton.css';

// Text Skeleton
export const SkeletonText = ({ variant = 'text', className = '' }) => {
  return <div className={`skeleton-text ${variant} ${className}`}></div>;
};

// Avatar Skeleton
export const SkeletonAvatar = ({ size = 'medium', className = '' }) => {
  return <div className={`skeleton-avatar ${size} ${className}`}></div>;
};

// Button Skeleton
export const SkeletonButton = ({ size = 'medium', className = '' }) => {
  return <div className={`skeleton-button ${size} ${className}`}></div>;
};

// Card Skeleton
export const SkeletonCard = ({ children, className = '' }) => {
  return <div className={`skeleton-card ${className}`}>{children}</div>;
};

// Service Card Skeleton
export const SkeletonServiceCard = () => {
  return (
    <div className="skeleton-service-card">
      <div className="skeleton-service-image"></div>
      <div className="skeleton-service-content">
        <div className="skeleton-service-title skeleton"></div>
        <div className="skeleton-service-description skeleton"></div>
        <div className="skeleton-service-description skeleton"></div>
        <div className="skeleton-service-price skeleton"></div>
      </div>
    </div>
  );
};

// Pandit Card Skeleton
export const SkeletonPanditCard = () => {
  return (
    <div className="skeleton-pandit-card">
      <div className="skeleton-pandit-image skeleton"></div>
      <div className="skeleton-pandit-name skeleton"></div>
      <div className="skeleton-pandit-location skeleton"></div>
      <div className="skeleton-pandit-rating skeleton"></div>
    </div>
  );
};

// Services Grid Skeleton
export const SkeletonServicesGrid = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array(count).fill().map((_, index) => (
        <SkeletonServiceCard key={index} />
      ))}
    </div>
  );
};

// Pandits Grid Skeleton
export const SkeletonPanditsGrid = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array(count).fill().map((_, index) => (
        <SkeletonPanditCard key={index} />
      ))}
    </div>
  );
};

// Dashboard Stats Skeleton
export const SkeletonDashboardStats = () => {
  return (
    <div className="skeleton-stats-grid">
      {Array(4).fill().map((_, index) => (
        <div key={index} className="skeleton-stat-card">
          <div className="skeleton-stat-number skeleton"></div>
          <div className="skeleton-stat-label skeleton"></div>
        </div>
      ))}
    </div>
  );
};

// Filter Bar Skeleton
export const SkeletonFilterBar = () => {
  return (
    <div className="skeleton-filter-bar">
      <div className="skeleton-filter skeleton"></div>
      <div className="skeleton-filter skeleton"></div>
      <div className="skeleton-filter skeleton"></div>
    </div>
  );
};

// Table Skeleton
export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="skeleton-table">
      {Array(rows).fill().map((_, index) => (
        <div key={index} className="skeleton-table-row">
          {Array(columns).fill().map((_, colIndex) => (
            <div key={colIndex} className="skeleton-table-cell skeleton"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Pagination Skeleton
export const SkeletonPagination = () => {
  return (
    <div className="skeleton-pagination">
      <div className="skeleton-page-btn skeleton"></div>
      <div className="skeleton-page-btn skeleton"></div>
      <div className="skeleton-page-btn skeleton"></div>
      <div className="skeleton-page-btn skeleton"></div>
    </div>
  );
};

// Home Page Banner Skeleton
export const SkeletonBanner = () => {
  return (
    <div className="skeleton-banner" style={{
      width: '100%',
      height: '400px',
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'loading 1.5s infinite',
      borderRadius: '12px'
    }}></div>
  );
};

// Join Pandit Section Skeleton
export const SkeletonJoinPandit = () => {
  return (
    <div className="skeleton-join-pandit" style={{
      background: '#f5f5f5',
      borderRadius: '30px',
      padding: '50px 30px',
      margin: '60px 20px'
    }}>
      <div className="skeleton-avatar large" style={{ margin: '0 auto 20px' }}></div>
      <div className="skeleton-text heading" style={{ margin: '0 auto 15px' }}></div>
      <div className="skeleton-text subtitle" style={{ margin: '0 auto 30px' }}></div>
      <div className="skeleton-button large" style={{ margin: '0 auto' }}></div>
    </div>
  );
};

// How It Works Skeleton
export const SkeletonHowItWorks = () => {
  return (
    <div className="skeleton-how-it-works" style={{ padding: '40px 20px' }}>
      <div className="skeleton-text heading" style={{ margin: '0 auto 20px' }}></div>
      <div className="skeleton-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {Array(4).fill().map((_, index) => (
          <div key={index} className="skeleton-card" style={{ textAlign: 'center', padding: '20px' }}>
            <div className="skeleton-avatar" style={{ margin: '0 auto 15px' }}></div>
            <div className="skeleton-text small" style={{ margin: '0 auto' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Default Export with all skeletons
const Skeleton = {
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
  Button: SkeletonButton,
  Card: SkeletonCard,
  ServiceCard: SkeletonServiceCard,
  PanditCard: SkeletonPanditCard,
  ServicesGrid: SkeletonServicesGrid,
  PanditsGrid: SkeletonPanditsGrid,
  DashboardStats: SkeletonDashboardStats,
  FilterBar: SkeletonFilterBar,
  Table: SkeletonTable,
  Pagination: SkeletonPagination,
  Banner: SkeletonBanner,
  JoinPandit: SkeletonJoinPandit,
  HowItWorks: SkeletonHowItWorks,
};

export default Skeleton;