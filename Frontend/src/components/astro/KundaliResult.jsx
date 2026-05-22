// src/components/astro/KundaliResult.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/astroStyles/KundaliResult.css';

const PLANET_SYMBOLS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀',
  Mars: '♂', Jupiter: '♃', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_COLORS = {
  Sun: '#FF9933', Moon: '#C0C0C0', Mercury: '#90EE90', Venus: '#FFB6C1',
  Mars: '#FF4444', Jupiter: '#FFD700', Saturn: '#4169E1', Rahu: '#8B4513', Ketu: '#808080',
};

const STRENGTH_BADGE = {
  Exalted: { bg: '#2E8B57', label: 'Exalted' },
  'Own Sign': { bg: '#4169E1', label: 'Own Sign' },
  Neutral: { bg: '#888', label: 'Neutral' },
  Debilitated: { bg: '#CC3333', label: 'Debilitated' },
};

const NORTH_INDIAN_POSITIONS = [
  { house: 12, r: 0, c: 0 }, { house: 1, r: 0, c: 1 }, { house: 2, r: 0, c: 2 }, { house: 3, r: 0, c: 3 },
  { house: 11, r: 1, c: 0 }, { house: 4, r: 1, c: 3 },
  { house: 10, r: 2, c: 0 }, { house: 5, r: 2, c: 3 },
  { house: 9, r: 3, c: 0 }, { house: 8, r: 3, c: 1 }, { house: 7, r: 3, c: 2 }, { house: 6, r: 3, c: 3 },
];

function KundaliChart({ houses, lagna }) {
  const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
  const RASHI_ENG = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const lagnaIdx = RASHI.indexOf(lagna);

  const signForHouse = (h) => RASHI_ENG[(lagnaIdx + h - 1) % 12];

  return (
    <div style={{ fontFamily: 'serif' }}>
      <table className="kundali-result-chart-table">
        <tbody>
          {[0, 1, 2, 3].map(row => (
            <tr key={row}>
              {[0, 1, 2, 3].map(col => {
                const cell = NORTH_INDIAN_POSITIONS.find(p => p.r === row && p.c === col);
                if (!cell) {
                  if ((row === 1 || row === 2) && (col === 1 || col === 2)) {
                    if (row === 1 && col === 1) return (
                      <td key={col} rowSpan={2} colSpan={2} className="kundali-result-chart-center">
                        <div style={{ color: '#D4AF37', fontSize: '13px', fontWeight: 'bold' }}>☯</div>
                        <div style={{ color: 'rgba(212,175,55,0.6)', fontSize: '9px' }}>KUNDALI</div>
                      </td>
                    );
                    return null;
                  }
                  return <td key={col} style={{ border: '1px solid rgba(212,175,55,0.2)' }} />;
                }
                const h = cell.house;
                const planetsInHouse = (houses[h] || []).filter(p => p !== 'Lagna');
                return (
                  <td key={col} className={`kundali-result-chart-cell ${h === 1 ? 'lagna' : ''}`}>
                    <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '9px', marginBottom: '1px' }}>
                      {h === 1 ? '1 ✦' : h}
                    </div>
                    <div style={{ color: 'rgba(212,175,55,0.4)', fontSize: '8px', marginBottom: '2px' }}>
                      {signForHouse(h)}
                    </div>
                    {planetsInHouse.map(p => (
                      <div key={p} style={{ color: PLANET_COLORS[p] || '#ccc', fontSize: '11px', lineHeight: 1.3 }}>
                        {PLANET_SYMBOLS[p] || ''} <span style={{ fontSize: '9px' }}>{p}</span>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KundaliResult() {
  const location = useLocation();
  const data = location.state?.data;

  if (!data) {
    return <div className="kundali-result-no-data">No Kundali data found.</div>;
  }

  const [activeTab, setActiveTab] = useState('chart');
  const { name, kundali } = data;

  const tabs = [
    { id: 'chart', label: '🗺 Chart' },
    { id: 'planets', label: '🪐 Planets' },
    { id: 'panchang', label: '📅 Panchang' },
    { id: 'dasha', label: '⏱ Dasha' },
    { id: 'yogas', label: '✨ Yogas' },
    { id: 'marriage', label: '💍 Marriage Yoga' },
    { id: 'doshas', label: '⚠ Doshas' },
    { id: 'scores', label: '📊 Scores' },
  ];

  const activeYogas = (kundali.yogas || []).filter(y => y.present).length;
  const activeDoshas = (kundali.doshas || []).filter(d => d.present).length;

  const getScoreFillClass = (val) => {
    if (val >= 70) return 'high';
    if (val >= 40) return 'medium';
    return 'low';
  };

  return (
    <div className="kundali-result-container">
      <div className="kundali-result-header">
        <div className="kundali-result-title">🌟 {name}'s Kundali</div>
        <div className="kundali-result-subtitle">
          Lagna: {kundali.lagna} ({kundali.lagnaEnglish}) • {kundali.lagnaDegree} • {kundali.lagnaNakshatra} Pada {kundali.lagnaPada}
        </div>
      </div>

      <div className="kundali-result-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`kundali-result-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.id === 'yogas' && activeYogas > 0 && <span style={{ marginLeft: '4px', color: '#90EE90', fontSize: '10px' }}>({activeYogas})</span>}
            {t.id === 'doshas' && activeDoshas > 0 && <span style={{ marginLeft: '4px', color: '#FF6B6B', fontSize: '10px' }}>({activeDoshas})</span>}
          </button>
        ))}
      </div>

      {activeTab === 'chart' && (
        <div>
          <div className="kundali-result-info-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">Lagna (Ascendant)</div>
              <div className="kundali-result-info-value">{kundali.lagna}</div>
              <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '11px' }}>{kundali.lagnaEnglish}</div>
            </div>
            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">Moon Sign (Rashi)</div>
              <div className="kundali-result-info-value">{kundali.planets?.find(p => p.name === 'Moon')?.sign}</div>
              <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '11px' }}>{kundali.nakshatra} P{kundali.nakshatra_pada}</div>
            </div>
            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">Sun Sign</div>
              <div className="kundali-result-info-value">{kundali.planets?.find(p => p.name === 'Sun')?.sign}</div>
              <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '11px' }}>{kundali.planets?.find(p => p.name === 'Sun')?.english}</div>
            </div>
          </div>
          <KundaliChart houses={kundali.houses} lagna={kundali.lagna} />
          <div style={{ textAlign: 'center', marginTop: '10px', color: 'rgba(212,175,55,0.4)', fontSize: '11px' }}>
            North Indian Style • Lahiri Ayanamsa • Sidereal
          </div>
        </div>
      )}

      {activeTab === 'planets' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px 50px 60px', gap: '4px', padding: '6px 8px', fontSize: '10px', color: 'rgba(212,175,55,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <div>Planet</div><div>Sign / Nakshatra</div><div>Degree</div><div>House</div><div>Strength</div>
          </div>
          {(kundali.planets || []).map(p => (
            <div key={p.name} className="kundali-result-planet-row">
              <div>
                <span style={{ color: PLANET_COLORS[p.name] || '#ccc', fontSize: '16px' }}>{PLANET_SYMBOLS[p.name]}</span>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{p.name}</div>
              </div>
              <div>
                <div style={{ color: '#e8d5a3' }}>{p.sign}</div>
                <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '10px' }}>{p.nakshatra} P{p.pada}</div>
                <div style={{ color: 'rgba(212,175,55,0.35)', fontSize: '9px' }}>D9: {p.navamsa}</div>
              </div>
              <div style={{ color: 'rgba(212,175,55,0.7)', fontSize: '11px' }}>{p.degreeDMS}</div>
              <div style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{p.house}</div>
              <div>
                <span className="kundali-result-badge" style={{ background: (STRENGTH_BADGE[p.strength] || { bg: '#888' }).bg }}>
                  {p.strength}
                </span>
                {p.retrograde && <div style={{ color: '#FF9933', fontSize: '9px', marginTop: '2px' }}>℞ Retro</div>}
                {p.combust && <div style={{ color: '#FF4444', fontSize: '9px', marginTop: '2px' }}>🔥 Combust</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'panchang' && (
        <div>
          <div className="kundali-result-section-title">Birth Panchang (पञ्चाङ्ग)</div>
          <div className="kundali-result-info-grid">
            {[
              ['Tithi', `${kundali.tithi_name} (${kundali.tithi_number})`],
              ['Paksha', kundali.paksha],
              ['Nakshatra', `${kundali.nakshatra} Pada ${kundali.nakshatra_pada}`],
              ['Yoga (पञ्चाङ्ग)', kundali.yoga_name],
              ['Karana', kundali.karana_name],
              ['Ayanamsa', `${kundali.ayanamsa}°`],
            ].map(([label, val]) => (
              <div key={label} className="kundali-result-info-card">
                <div className="kundali-result-info-label">{label}</div>
                <div className="kundali-result-info-value">{val}</div>
              </div>
            ))}
          </div>
          <div className="kundali-result-section-title">Lagna & D9 Details</div>
          <div className="kundali-result-info-grid">
            {[
              ['Lagna Nakshatra', `${kundali.lagnaNakshatra} Pada ${kundali.lagnaPada}`],
              ['Navamsa (D9) Lagna', kundali.d9_lagna],
              ['Lagna Degree', kundali.lagnaDegree],
              ['Julian Day', kundali.julian_day?.toFixed(2)],
            ].map(([label, val]) => (
              <div key={label} className="kundali-result-info-card">
                <div className="kundali-result-info-label">{label}</div>
                <div className="kundali-result-info-value">{val}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '8px', padding: '12px', color: 'rgba(212,175,55,0.5)', fontSize: '11px', marginTop: '8px' }}>
            <strong style={{ color: 'rgba(212,175,55,0.7)' }}>Yoga</strong> is the combined sum of Sun + Moon longitudes divided into 27 parts.<br />
            <strong style={{ color: 'rgba(212,175,55,0.7)' }}>Karana</strong> is half a Tithi — there are 11 Karanas, 7 movable and 4 fixed.
          </div>
        </div>
      )}

      {activeTab === 'dasha' && (
        <div>
          <div className="kundali-result-info-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">Current Mahadasha</div>
              <div className="kundali-result-info-value">{kundali.mahadasha}</div>
            </div>
            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">Balance at Birth</div>
              <div className="kundali-result-info-value">{kundali.dasha_balance}</div>
            </div>
            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">Moon Nakshatra</div>
              <div className="kundali-result-info-value">{kundali.nakshatra}</div>
              <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '11px' }}>Pada {kundali.nakshatra_pada}</div>
            </div>
          </div>

          <div className="kundali-result-section-title">
            Antardasha (Sub-periods) within {kundali.mahadasha} Mahadasha
          </div>

          {(kundali.antardasha_list || []).length === 0 ? (
            <div style={{ color: 'rgba(212,175,55,0.4)', fontSize: '13px', padding: '16px', textAlign: 'center' }}>
              No antardasha data available.
            </div>
          ) : (
            (kundali.antardasha_list).map((ad, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                marginBottom: '6px',
                background: i === 0 ? 'rgba(212,175,55,0.12)' : 'rgba(212,175,55,0.03)',
                borderRadius: '8px',
                border: `1px solid ${i === 0 ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.1)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: PLANET_COLORS[ad.lord] || '#ccc', fontSize: '18px' }}>
                    {PLANET_SYMBOLS[ad.lord] || '•'}
                  </span>
                  <div>
                    <div style={{ color: i === 0 ? '#D4AF37' : '#e8d5a3', fontWeight: i === 0 ? 'bold' : 'normal', fontSize: '14px' }}>
                      {kundali.mahadasha} / {ad.lord}
                    </div>
                    {i === 0 && (
                      <div style={{ color: 'rgba(212,175,55,0.5)', fontSize: '10px' }}>Currently Running</div>
                    )}
                  </div>
                </div>
                <div style={{ color: 'rgba(212,175,55,0.7)', fontSize: '13px', fontWeight: 'bold' }}>
                  {ad.years} yrs
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: '16px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '8px', padding: '12px', color: 'rgba(212,175,55,0.5)', fontSize: '11px' }}>
            Vimshottari Dasha — 120-year cycle based on Moon's nakshatra at birth. The sequence within each Mahadasha follows the same Vimshottari order starting from the Mahadasha lord.
          </div>
        </div>
      )}

      {activeTab === 'marriage' && (
        <div>

          <div className="kundali-result-section-title">
            Marriage Yoga Analysis
          </div>

          <div className="kundali-result-info-grid">

            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">
                Marriage Strength
              </div>

              <div className="kundali-result-info-value">
                {kundali.marriage_yoga?.strength || 'N/A'}
              </div>
            </div>

            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">
                Marriage Type
              </div>

              <div className="kundali-result-info-value">
                {kundali.marriage_yoga?.marriage_type || 'N/A'}
              </div>
            </div>

            <div className="kundali-result-info-card">
              <div className="kundali-result-info-label">
                Marriage Score
              </div>

              <div className="kundali-result-info-value">
                {kundali.marriage_yoga?.score || 0}/100
              </div>
            </div>

          </div>

          <div className="kundali-result-section-title">
            Strong Marriage Periods
          </div>

          {(kundali.marriage_yoga?.favorable_periods || []).length === 0 ? (

            <div style={{
              color: 'rgba(212,175,55,0.5)',
              padding: '12px',
            }}>
              No strong periods detected.
            </div>

          ) : (

            kundali.marriage_yoga.favorable_periods.map((p, i) => (

              <div
                key={i}
                className="kundali-result-yoga-card present"
              >

                <div style={{
                  color: '#90EE90',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                }}>
                  {p.period}
                </div>

                <div style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '12px',
                }}>
                  {p.reason}
                </div>

              </div>

            ))
          )}

          <div className="kundali-result-section-title">
            Delay Indicators
          </div>

          {(kundali.marriage_yoga?.delay_indications || []).length === 0 ? (

            <div style={{
              color: '#90EE90',
              padding: '12px',
            }}>
              No major delay combinations detected.
            </div>

          ) : (

            kundali.marriage_yoga.delay_indications.map((d, i) => (

              <div
                key={i}
                className="kundali-result-dosha-card present"
              >

                <div style={{
                  color: '#FFB366',
                  fontSize: '12px',
                }}>
                  ⚠ {d}
                </div>

              </div>

            ))
          )}

          <div className="kundali-result-section-title">
            Positive Indicators
          </div>

          {(kundali.marriage_yoga?.reasons || []).map((r, i) => (

            <div
              key={i}
              className="kundali-result-yoga-card present"
            >

              <div style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '12px',
              }}>
                ✨ {r}
              </div>

            </div>

          ))}

        </div>
      )}

      {activeTab === 'yogas' && (
        <div>
          <div style={{ marginBottom: '12px', color: 'rgba(212,175,55,0.6)', fontSize: '12px' }}>
            {activeYogas} yoga(s) active in your chart
          </div>
          {(kundali.yogas || []).length === 0 ? (
            <div style={{ color: 'rgba(212,175,55,0.4)', fontSize: '13px', padding: '16px', textAlign: 'center' }}>
              No yoga data available.
            </div>
          ) : (
            [...(kundali.yogas || [])]
              .sort((a, b) => Number(b.present) - Number(a.present))
              .map((y, i) => (
                <div key={i} className={`kundali-result-yoga-card ${y.present ? 'present' : 'absent'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ color: y.present ? '#90EE90' : 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: '13px' }}>
                      {y.name}
                    </div>
                    <span className="kundali-result-badge" style={{ background: y.present ? '#2E8B57' : '#555', fontSize: '9px' }}>
                      {y.present ? '✓ Active' : 'Absent'}
                    </span>
                  </div>
                  <div style={{ color: y.present ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                    {y.description}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {activeTab === 'doshas' && (
        <div>
          <div style={{ marginBottom: '12px', color: 'rgba(212,175,55,0.6)', fontSize: '12px' }}>
            {activeDoshas} dosha(s) present in your chart
          </div>
          {(kundali.doshas || []).length === 0 ? (
            <div style={{ color: 'rgba(212,175,55,0.4)', fontSize: '13px', padding: '16px', textAlign: 'center' }}>
              No dosha data available.
            </div>
          ) : (
            [...(kundali.doshas || [])]
              .sort((a, b) => Number(b.present) - Number(a.present))
              .map((d, i) => (
                <div key={i} className={`kundali-result-dosha-card ${d.present ? 'present' : 'absent'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ color: d.present ? '#FF6B6B' : '#90EE90', fontWeight: 'bold', fontSize: '13px' }}>
                      {d.name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {d.present && (
                        <span className="kundali-result-badge" style={{
                          background: d.severity === 'High' ? '#CC3333' : d.severity === 'Medium' ? '#E07800' : '#888'
                        }}>
                          {d.severity}
                        </span>
                      )}
                      <span className="kundali-result-badge" style={{ background: d.present ? '#8B0000' : '#2E8B57' }}>
                        {d.present ? 'Present' : 'Clear'}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: d.present ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: d.present ? '10px' : '0' }}>
                    {d.description}
                  </div>
                  {d.present && (d.remedies || []).length > 0 && (
                    <div>
                      <div style={{ color: '#D4AF37', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                        🙏 Remedies:
                      </div>
                      {d.remedies.map((r, j) => (
                        <div key={j} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginBottom: '3px', paddingLeft: '8px' }}>
                          • {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {activeTab === 'scores' && (
        <div>
          <div className="kundali-result-section-title">Astrological Strength Scores</div>
          {Object.entries(kundali.scores || {}).map(([key, val]) => (
            <div key={key} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ color: '#e8d5a3', fontSize: '13px', textTransform: 'capitalize' }}>
                  {key.replace(/_/g, ' ').replace('score', '').trim()}
                </div>
                <div style={{ color: '#D4AF37', fontSize: '13px', fontWeight: 'bold' }}>{val}%</div>
              </div>
              <div className="kundali-result-score-bar">
                <div className={`kundali-result-score-fill ${getScoreFillClass(val)}`} style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(212,175,55,0.05)', borderRadius: '8px', color: 'rgba(212,175,55,0.5)', fontSize: '11px' }}>
            Scores are calculated based on planetary positions, house placements, exaltation/debilitation, and aspect interactions using classical Vedic principles.
          </div>
        </div>
      )}
    </div>
  );
}
