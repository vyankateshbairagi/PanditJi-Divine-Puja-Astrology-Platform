// src/components/astro/HoroscopeTool.jsx
import React, { useState } from 'react';
import { getDailyHoroscope } from '../../api/freeAstroApi';
import { useNavigate } from 'react-router-dom';
import '../../styles/astroStyles/HoroscopeTool.css';


const SIGNS = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 – Apr 19', element: 'Fire', color: '#FF4444' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 – May 20', element: 'Earth', color: '#2E8B57' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 – Jun 20', element: 'Air', color: '#4169E1' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 – Jul 22', element: 'Water', color: '#C0C0C0' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 – Aug 22', element: 'Fire', color: '#FF9933' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 – Sep 22', element: 'Earth', color: '#90EE90' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 – Oct 22', element: 'Air', color: '#FFB6C1' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 – Nov 21', element: 'Water', color: '#8B0000' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 – Dec 21', element: 'Fire', color: '#9370DB' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 – Jan 19', element: 'Earth', color: '#4682B4' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 – Feb 18', element: 'Air', color: '#00CED1' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 – Mar 20', element: 'Water', color: '#7B68EE' },
];

export default function HoroscopeTool() {
  const navigate = useNavigate();
  const [selectedSign, setSelectedSign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHoroscope = async (sign) => {
    setSelectedSign(sign.name);
    setError(null);
    setLoading(true);
    try {
      const res = await getDailyHoroscope(sign.name);
      if (res.data.success) {
        navigate('/astro/horoscope/result', {
          state: { data: res.data },
        });
      } else {
        setError(res.data.message || 'Failed to load horoscope.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="horoscope-tool-wrapper">
        <div className="horoscope-tool-title">☀️ Free Daily Horoscope</div>
        <div className="horoscope-tool-subtitle">दैनिक राशिफल • Select your Sun sign for today's reading</div>

        <div className="horoscope-tool-grid">
          {SIGNS.map(sign => (
            <div
              key={sign.name}
              className={`horoscope-tool-sign-card ${selectedSign === sign.name ? 'selected' : ''}`}
              style={{
                background: selectedSign === sign.name ? `${sign.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedSign === sign.name ? sign.color : 'rgba(212,175,55,0.15)'}`,
              }}
              onClick={() => fetchHoroscope(sign)}
            >
              <div className="horoscope-tool-sign-symbol" style={{ color: sign.color }}>{sign.symbol}</div>
              <div className={`horoscope-tool-sign-name ${selectedSign === sign.name ? 'selected' : ''}`}>
                {sign.name}
              </div>
              <div className="horoscope-tool-dates">{sign.dates}</div>
              <div className="horoscope-tool-element">{sign.element}</div>
            </div>
          ))}
        </div>

        {!selectedSign && (
          <div className="horoscope-tool-hint">
            ✦ Tap your zodiac sign above to receive today's cosmic guidance ✦
          </div>
        )}

        {loading && (
          <div className="horoscope-tool-loading">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔮</div>
            Consulting the planetary positions for {selectedSign}...
          </div>
        )}

        {error && <div className="horoscope-tool-error">⚠ {error}</div>}

        <div className="horoscope-tool-disclaimer">
          🔒 Free service • Based on actual current planetary transits • Vedic Jyotish principles
        </div>
      </div>
    </div>
  );
}