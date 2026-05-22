// src/components/astro/CompatibilityTool.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/astroStyles/CompatibilityTool.css';
import { buildUrl } from '../../config';

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

export default function CompatibilityTool() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    boy: {
      name: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: '',
      lat: '',
      lon: '',
      timezone: '5.5',
    },
    girl: {
      name: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: '',
      lat: '',
      lon: '',
      timezone: '5.5',
    },
  });

  const [boyCitySearch, setBoyCitySearch] = useState('');
  const [girlCitySearch, setGirlCitySearch] = useState('');
  const [showBoyCities, setShowBoyCities] = useState(false);
  const [showGirlCities, setShowGirlCities] = useState(false);

  const filteredBoyCities = PRESET_CITIES.filter(c =>
    c.name.toLowerCase().includes(boyCitySearch.toLowerCase())
  );

  const filteredGirlCities = PRESET_CITIES.filter(c =>
    c.name.toLowerCase().includes(girlCitySearch.toLowerCase())
  );

  function update(section, field, value) {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }

  function selectCity(person, city) {
    setForm(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        placeOfBirth: city.name,
        lat: city.lat,
        lon: city.lon,
      },
    }));

    if (person === 'boy') {
      setBoyCitySearch(city.name);
      setShowBoyCities(false);
    } else {
      setGirlCitySearch(city.name);
      setShowGirlCities(false);
    }
  }

  function transformPayload(person) {
    const [year, month, day] = person.dateOfBirth.split('-');
    const [hour, minute] = person.timeOfBirth.split(':');

    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      timezone: parseFloat(person.timezone),
      latitude: parseFloat(person.lat),
      longitude: parseFloat(person.lon),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
  setLoading(true);

  const payload = {
    boy: transformPayload(form.boy),
    girl: transformPayload(form.girl),
  };

  const token = localStorage.getItem('userToken');

  console.log('TOKEN:', token);

  const res = await axios.post(
    buildUrl('/astro/compatibility'),
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  navigate('/astro/compatibility/result', {
    state: {
      result: res.data.compatibility,
      form,
    },
  });

} catch (err) {
  console.error(err);

  setError(
    err.response?.data?.message ||
    'Compatibility calculation failed'
  );
} finally {
  setLoading(false);
}
  }

  function renderPartnerForm(
    title,
    key,
    citySearch,
    setCitySearch,
    showCities,
    setShowCities,
    filteredCities
  ) {
    return (
      <div className="compatibility-tool-card">
        <div className="compatibility-tool-section-title">{title}</div>

        <div className="compatibility-tool-field">
          <label className="compatibility-tool-label">Full Name</label>
          <input
            className="compatibility-tool-input"
            placeholder="Enter full name"
            value={form[key].name}
            onChange={e => update(key, 'name', e.target.value)}
          />
        </div>

        <div className="compatibility-tool-coords-grid">
          <div>
            <label className="compatibility-tool-label">Date of Birth</label>
            <input
              type="date"
              className="compatibility-tool-input"
              value={form[key].dateOfBirth}
              onChange={e => update(key, 'dateOfBirth', e.target.value)}
            />
          </div>
          <div>
            <label className="compatibility-tool-label">Time of Birth</label>
            <input
              type="time"
              className="compatibility-tool-input"
              value={form[key].timeOfBirth}
              onChange={e => update(key, 'timeOfBirth', e.target.value)}
            />
          </div>
        </div>

        <div className="compatibility-tool-field">
          <label className="compatibility-tool-label">Place of Birth</label>
          <input
            className="compatibility-tool-input"
            placeholder="Search city..."
            value={citySearch}
            onChange={e => {
              setCitySearch(e.target.value);
              setShowCities(true);
            }}
            onFocus={() => setShowCities(true)}
            onBlur={() => setTimeout(() => setShowCities(false), 200)}
          />
          {showCities && filteredCities.length > 0 && (
            <div className="compatibility-tool-city-dropdown">
              {filteredCities.map(city => (
                <div
                  key={city.name}
                  className="compatibility-tool-city-option"
                  onMouseDown={() => selectCity(key, city)}
                >
                  {city.name}
                  <span className="compatibility-tool-city-coords">
                    ({city.lat}°N, {city.lon}°E)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="compatibility-tool-coords-grid">
          <div>
            <label className="compatibility-tool-label">Latitude</label>
            <input
              type="number"
              className="compatibility-tool-input"
              value={form[key].lat}
              onChange={e => update(key, 'lat', e.target.value)}
            />
          </div>
          <div>
            <label className="compatibility-tool-label">Longitude</label>
            <input
              type="number"
              className="compatibility-tool-input"
              value={form[key].lon}
              onChange={e => update(key, 'lon', e.target.value)}
            />
          </div>
        </div>

        <div className="compatibility-tool-field">
          <label className="compatibility-tool-label">Timezone</label>
          <select
            className="compatibility-tool-select"
            value={form[key].timezone}
            onChange={e => update(key, 'timezone', e.target.value)}
          >
            <option value="5.5">IST +5:30</option>
            <option value="0">UTC +0:00</option>
            <option value="5">PKT +5:00</option>
            <option value="5.75">NPT +5:45</option>
            <option value="6">BST +6:00</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="compatibility-tool-wrapper">
      <div className="compatibility-tool-title">💞 Kundali Compatibility</div>
      <div className="compatibility-tool-subtitle">
        Advanced Vedic matchmaking powered by Swiss Ephemeris
      </div>

      <form onSubmit={handleSubmit}>
        <div className="compatibility-tool-grid">
          {renderPartnerForm(
            'Boy Details',
            'boy',
            boyCitySearch,
            setBoyCitySearch,
            showBoyCities,
            setShowBoyCities,
            filteredBoyCities
          )}
          {renderPartnerForm(
            'Girl Details',
            'girl',
            girlCitySearch,
            setGirlCitySearch,
            showGirlCities,
            setShowGirlCities,
            filteredGirlCities
          )}
        </div>

        {error && <div className="compatibility-tool-error">⚠ {error}</div>}

        <button type="submit" className="compatibility-tool-button">
          {loading ? '✨ Calculating Compatibility...' : '✦ Check Compatibility ✦'}
        </button>
      </form>
    </div>
  );
}
