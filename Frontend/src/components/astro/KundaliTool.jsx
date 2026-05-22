// src/components/astro/KundaliTool.jsx
import React, { useState } from 'react';
import { calculateKundali } from '../../api/freeAstroApi';
import { useNavigate } from 'react-router-dom';
// import './KundaliTool.css';
import '../../styles/astroStyles/KundaliTool.css';

const PRESET_CITIES = [
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lon: 77.1025 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'Varanasi', lat: 25.3176, lon: 82.9739 },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882 },
  { name: 'Surat', lat: 21.1702, lon: 72.8311 },
  
];

export default function KundaliTool() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    lat: '',
    lon: '',
    timezone: '5.5',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [citySearch, setCitySearch] = useState('');
  const [showCities, setShowCities] = useState(false);

  const filteredCities = PRESET_CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const selectCity = (city) => {
    setForm(f => ({ ...f, placeOfBirth: city.name, lat: city.lat, lon: city.lon }));
    setCitySearch(city.name);
    setShowCities(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.dateOfBirth || !form.timeOfBirth || !form.lat || !form.lon) {
      setError('Please fill in all fields including location.');
      return;
    }
    setLoading(true);
    try {
      const res = await calculateKundali({
        name: form.name,
        dateOfBirth: form.dateOfBirth,
        timeOfBirth: form.timeOfBirth,
        placeOfBirth: form.placeOfBirth,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        timezone: parseFloat(form.timezone),
      });
      if (res.data.success) {
        navigate('/astro/kundali/result', {
          state: { data: res.data },
        });
      } else {
        setError(res.data.message || 'Failed to calculate kundali.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="kundali-tool-wrapper">
        <div className="kundali-tool-title">🌿 Free Birth Kundali</div>
        <div className="kundali-tool-subtitle">प्रारम्भिक कुण्डली • Generate your Vedic birth chart instantly</div>

        <form onSubmit={handleSubmit}>
          <div className="kundali-tool-name-field">
            <label className="kundali-tool-label">Full Name</label>
            <input
              className="kundali-tool-input"
              placeholder="Enter your name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="kundali-tool-grid">
            <div>
              <label className="kundali-tool-label">Date of Birth</label>
              <input
                type="date"
                className="kundali-tool-input"
                value={form.dateOfBirth}
                onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
              />
            </div>
            <div>
              <label className="kundali-tool-label">Time of Birth</label>
              <input
                type="time"
                className="kundali-tool-input"
                value={form.timeOfBirth}
                onChange={e => setForm(f => ({ ...f, timeOfBirth: e.target.value }))}
              />
            </div>
          </div>

          <div className="kundali-tool-field">
            <label className="kundali-tool-label">Place of Birth</label>
            <input
              className="kundali-tool-input"
              placeholder="Search city or enter manually..."
              value={citySearch}
              onChange={e => { setCitySearch(e.target.value); setShowCities(true); }}
              onFocus={() => setShowCities(true)}
              onBlur={() => setTimeout(() => setShowCities(false), 200)}
            />
            {showCities && filteredCities.length > 0 && (
              <div className="kundali-tool-city-dropdown">
                {filteredCities.map(c => (
                  <div
                    key={c.name}
                    className="kundali-tool-city-option"
                    onMouseDown={() => selectCity(c)}
                  >
                    {c.name}
                    <span style={{ color: 'rgba(212,175,55,0.4)', fontSize: '11px' }}>
                      ({c.lat}°N, {c.lon}°E)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="kundali-tool-coords-grid">
            <div>
              <label className="kundali-tool-label">Latitude</label>
              <input
                type="number"
                step="0.0001"
                className="kundali-tool-input"
                placeholder="e.g. 18.5204"
                value={form.lat}
                onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
              />
            </div>
            <div>
              <label className="kundali-tool-label">Longitude</label>
              <input
                type="number"
                step="0.0001"
                className="kundali-tool-input"
                placeholder="e.g. 73.8567"
                value={form.lon}
                onChange={e => setForm(f => ({ ...f, lon: e.target.value }))}
              />
            </div>
          </div>

          <div className="kundali-tool-field">
            <label className="kundali-tool-label">Timezone (UTC offset)</label>
            <select
              className="kundali-tool-select"
              value={form.timezone}
              onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
            >
              <option value="5.5">IST +5:30 (India)</option>
              <option value="0">UTC +0:00</option>
              <option value="5">PKT +5:00 (Pakistan)</option>
              <option value="5.75">NPT +5:45 (Nepal)</option>
              <option value="6">BST +6:00 (Bangladesh)</option>
            </select>
          </div>

          {error && <div className="kundali-tool-error">⚠ {error}</div>}

          <button type="submit" className="kundali-tool-btn" disabled={loading}>
            {loading ? '✨ Calculating your Kundali...' : '✦ Generate My Kundali ✦'}
          </button>
        </form>

        <div className="kundali-tool-disclaimer">
          🔒 Free service • Calculations use Lahiri Ayanamsa sidereal system • For accurate results, use exact birth time
        </div>
      </div>
    </div>
  );
}