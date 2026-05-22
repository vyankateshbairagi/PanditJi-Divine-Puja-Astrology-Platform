import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faGift, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import '../../styles/SpecialOffer.css';

const SpecialOfferBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('DIVINE10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="special-offer-banner">
      <div className="offer-content">
        <div className="offer-icon">
          <FontAwesomeIcon icon={faGift} />
        </div>
        <div className="offer-text">
          <h3 className="offer-title">Exclusive Offer</h3>
          <p className="offer-description">Get 10% OFF on your first puja booking</p>
        </div>
        <div className="offer-code">
          <span className="code-label">Code: </span>
          <button className="code-button" onClick={handleCopyCode} title="Copy code">
            <span className="code-value">DIVINE10</span>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
          </button>
        </div>
      </div>
      <button
        className="offer-close"
        onClick={() => setIsVisible(false)}
        aria-label="Close offer"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default SpecialOfferBanner;
