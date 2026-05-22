// src/components/astro/HoroscopeResult.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/astroStyles/HoroscopeResult.css';

const STAR_DOMAINS = ['overall', 'love', 'career', 'health', 'finance', 'luck'];

const DOMAIN_ICONS = {
  overall: '🌟', love: '💕', career: '💼', health: '🌿', finance: '💰', luck: '🍀'
};

const DOMAIN_COLORS = {
  overall: '#D4AF37', love: '#FF69B4', career: '#4169E1',
  health: '#2E8B57', finance: '#FFD700', luck: '#9370DB'
};

function StarRating({ stars, color }) {
  return (
    <div className="horoscope-result-star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          fontSize: '14px',
          color: i <= Math.floor(stars) ? color : i - 0.5 === stars ? color : 'rgba(255,255,255,0.15)',
          opacity: i - 0.5 === stars ? 0.5 : 1,
        }}>★</span>
      ))}
      <span className="horoscope-result-star-label">{stars}/5</span>
    </div>
  );
}

export default function HoroscopeResult() {
  const location = useLocation();
  const data = location.state?.data;

  if (!data) {
    return <div className="horoscope-result-no-data">No Horoscope data found.</div>;
  }

  const h = data.horoscope;

  return (
    <div className="horoscope-result-container">
      <div className="horoscope-result-header">
        <div className="horoscope-result-sign">{h.sign} Daily Horoscope</div>
        <div className="horoscope-result-date">{h.date}</div>
        <div className="horoscope-result-overall-score">
          <span style={{ fontSize: '18px' }}>🌟</span>
          <StarRating stars={h.star_scores.overall} color="#D4AF37" />
        </div>
        <div className="horoscope-result-info-row">
          <span className="horoscope-result-pill">📅 {h.tithi}</span>
          <span className="horoscope-result-pill">🌙 {h.paksha} Paksha</span>
          <span className="horoscope-result-pill">⭐ {h.moon_nakshatra}</span>
        </div>
      </div>

      <div className="horoscope-result-section-title">✦ Today's Energies</div>
      <div className="horoscope-result-scores-grid">
        {STAR_DOMAINS.map(d => (
          <div key={d} className="horoscope-result-score-card">
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{DOMAIN_ICONS[d]}</div>
            <div style={{ color: DOMAIN_COLORS[d], fontSize: '11px', textTransform: 'capitalize', marginBottom: '4px' }}>{d}</div>
            <StarRating stars={h.star_scores[d]} color={DOMAIN_COLORS[d]} />
          </div>
        ))}
      </div>

      <div className="horoscope-result-section-title">🔮 Overview</div>
      <div className="horoscope-result-paragraph">{h.overview}</div>

      {[
        { key: 'love', icon: '💕', title: 'Love & Relationships', color: '#FF69B4' },
        { key: 'career', icon: '💼', title: 'Career & Work', color: '#4169E1' },
        { key: 'health', icon: '🌿', title: 'Health & Vitality', color: '#2E8B57' },
      ].map(s => (
        <div key={s.key}>
          <div className="horoscope-result-section-title">{s.icon} {s.title}</div>
          <div className="horoscope-result-section-card" style={{ background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <StarRating stars={h.star_scores[s.key]} color={s.color} />
            </div>
            <div style={{ color: '#ddd', lineHeight: 1.7, fontSize: '14px' }}>{h.sections[s.key]}</div>
          </div>
        </div>
      ))}

      <div className="horoscope-result-section-title">🍀 Lucky Indicators</div>
      <div className="horoscope-result-lucky-section">
        <div className="horoscope-result-lucky-card">
          <div className="horoscope-result-lucky-label">Lucky Number</div>
          <div className="horoscope-result-lucky-value">{h.lucky_number}</div>
        </div>
        <div className="horoscope-result-lucky-card">
          <div className="horoscope-result-lucky-label">Lucky Color</div>
          <div className="horoscope-result-lucky-value">{h.lucky_color}</div>
        </div>
        <div className="horoscope-result-lucky-card">
          <div className="horoscope-result-lucky-label">Best Time</div>
          <div className="horoscope-result-lucky-value">{h.best_time}</div>
        </div>
      </div>

      <div className="horoscope-result-section-title">💞 Compatible Signs Today</div>
      <div style={{ marginBottom: '16px' }}>
        {h.compatible_signs.map(s => (
          <span key={s} className="horoscope-result-compat-sign">{s}</span>
        ))}
      </div>

      {h.key_transits && h.key_transits.length > 0 && (
        <>
          <div className="horoscope-result-section-title">🌌 Planetary Influences</div>
          {h.key_transits.slice(0, 4).map((t, i) => (
            <div key={i} className="horoscope-result-transit-item">✦ {t}</div>
          ))}
        </>
      )}

      <div className="horoscope-result-section-title">🕉 Today's Mantra</div>
      <div className="horoscope-result-mantra-box">
        <div style={{ color: '#D4AF37', fontSize: '15px', marginBottom: '6px' }}>ॐ</div>
        {h.mantra}
      </div>
    </div>
  );
}