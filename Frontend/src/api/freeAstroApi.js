// src/api/freeAstroApi.js
import apiClient from './apiClient';

/**
 * Calculate Birth Kundali (free service)
 * @param {Object} params
 * @param {string} params.name - Person's name
 * @param {string} params.dateOfBirth - YYYY-MM-DD
 * @param {string} params.timeOfBirth - HH:MM
 * @param {string} params.placeOfBirth - City name (display only)
 * @param {number} params.lat - Latitude
 * @param {number} params.lon - Longitude
 * @param {number} [params.timezone=5.5] - UTC offset in hours (default IST)
 */
export const calculateKundali = (params) =>
  apiClient.post('/free-astro/kundali', params);

/**
 * Get daily horoscope for a sign
 * @param {string} sign - e.g. 'Aries', 'Taurus', etc.
 */
export const getDailyHoroscope = (sign) =>
  apiClient.get(`/free-astro/horoscope/${sign}`);

/**
 * Get horoscopes for all 12 signs at once
 */
export const getAllHoroscopes = () =>
  apiClient.get('/free-astro/all-horoscopes');