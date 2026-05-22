import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/astroStyles/CompatibilityResult.css';

export default function CompatibilityResult() {
  const location = useLocation();
  const data = location.state?.result;

  if (!data) {
    return <div className="compatibility-no-data">No compatibility data found.</div>;
  }

  return (
    <div className="compatibility-result-wrapper">
      <div className="compatibility-score-circle">{data.overall_score}%</div>
      <div className="compatibility-recommendation">{data.recommendation}</div>

      <div className="compatibility-section-title">✦ Guna Milan</div>
      <div className="compatibility-guna-grid">
        {Object.entries(data.guna_milan.details)
          .filter(([k]) => k !== 'total')
          .map(([k, v]) => (
            <div key={k} className="compatibility-guna-card">
              <div className="compatibility-guna-label">{k}</div>
              <div className="compatibility-guna-value">{v}</div>
            </div>
          ))}
      </div>
      <div className="compatibility-info-box">
        <div className="compatibility-total-score">{data.guna_milan.total}/36</div>
      </div>

      <div className="compatibility-section-title">✦ Elemental Compatibility</div>
      <div className="compatibility-info-box">
        <div className="compatibility-paragraph">
          Boy Element: <strong>{data.tattva_compatibility.boy_element}</strong>
          <br />
          Girl Element: <strong>{data.tattva_compatibility.girl_element}</strong>
          <br /><br />
          {data.tattva_compatibility.summary}
        </div>
      </div>

      <div className="compatibility-section-title">✦ Mangal Dosha Analysis</div>
      <div className="compatibility-info-box">
        <div className="compatibility-paragraph">
          Boy Manglik: <strong>{data.mangal_dosha.boy ? 'Yes' : 'No'}</strong>
          <br />
          Girl Manglik: <strong>{data.mangal_dosha.girl ? 'Yes' : 'No'}</strong>
          <br /><br />
          {data.mangal_dosha.summary}
        </div>
      </div>

      <div className="compatibility-section-title">✦ Emotional Compatibility</div>
      <div className="compatibility-info-box">
        <div className="compatibility-paragraph">{data.emotional_compatibility}</div>
      </div>

      <div className="compatibility-section-title">✦ Relationship Strengths</div>
      <div className="compatibility-info-box">
        <ul className="compatibility-list">
          {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div className="compatibility-section-title">✦ Potential Challenges</div>
      <div className="compatibility-info-box">
        <ul className="compatibility-list">
          {data.challenges.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div className="compatibility-section-title">✦ Suggested Remedies</div>
      <div className="compatibility-info-box">
        <ul className="compatibility-list">
          {data.remedies.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
    </div>
  );
}