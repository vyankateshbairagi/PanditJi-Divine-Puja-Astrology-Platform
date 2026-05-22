import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  faHeadset,
  faComments,
  faPhone,
  faEnvelope,
  faQuestionCircle,
  faTimes,
  faComment,
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/HelpWidget.css';

const HelpWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const helpOptions = [
    {
      icon: faComments,
      label: 'Live Chat',
      description: 'Chat with our team',
      action: () => navigate('/contact'),
      color: '#4CAF50',
    },
    {
      icon: faPhone,
      label: 'Call Support',
      description: '+91 98765 43210',
      action: () => globalThis.location.assign('tel:+919876543210'),
      color: '#2196F3',
    },
    {
      icon: faComment,
      label: 'WhatsApp',
      description: 'Chat on WhatsApp',
      action: () => window.open('https://wa.me/919876543210?text=Hi%20PanditJi%2C%20I%20need%20help.', '_blank', 'noopener,noreferrer'),
      color: '#25D366',
    },
    {
      icon: faEnvelope,
      label: 'Email Support',
      description: 'support@panditji.com',
      action: () => globalThis.location.assign('mailto:support@panditji.com'),
      color: '#FF6B6B',
    },
    {
      icon: faQuestionCircle,
      label: 'Help Center',
      description: 'FAQs & Guides',
      action: () => navigate('/contact'),
      color: '#FF9800',
    },
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="help-widget" ref={widgetRef}>
      <button
        className={`help-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Need Help?"
        title="Need Help?"
      >
        {isOpen ? (
          <FontAwesomeIcon icon={faTimes} />
        ) : (
          <>
            <FontAwesomeIcon icon={faHeadset} />
            <span className="help-label">Need Help?</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="help-menu">
          {helpOptions.map((option, idx) => (
            <button
              key={idx}
              className="help-option"
              onClick={() => {
                option.action();
                setIsOpen(false);
              }}
              style={{ '--option-color': option.color }}
            >
              <div className="option-icon">
                <FontAwesomeIcon icon={option.icon} />
              </div>
              <div className="option-content">
                <div className="option-label">{option.label}</div>
                <div className="option-description">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpWidget;
