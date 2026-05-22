const express = require('express');
const router = express.Router();
const { authenticateCustomer } = require('../middleware/auth');
const CompatibilityResult = require('../models/CompatibilityResult');

const {
  calculateChart,
} = require('../services/swissEphService');

// --------------------------------------
// CONSTANTS
// --------------------------------------

const SIGNS = [
  'Mesha',
  'Vrishabha',
  'Mithuna',
  'Karka',
  'Simha',
  'Kanya',
  'Tula',
  'Vrischika',
  'Dhanu',
  'Makara',
  'Kumbha',
  'Meena',
];

const TATTVA = {
  Mesha: 'Fire',
  Simha: 'Fire',
  Dhanu: 'Fire',

  Vrishabha: 'Earth',
  Kanya: 'Earth',
  Makara: 'Earth',

  Mithuna: 'Air',
  Tula: 'Air',
  Kumbha: 'Air',

  Karka: 'Water',
  Vrischika: 'Water',
  Meena: 'Water',
};

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

// --------------------------------------
// HELPERS
// --------------------------------------

function normalizeDeg(lon) {
  return ((lon % 360) + 360) % 360;
}

function signFromLon(lon) {
  const idx = Math.floor(normalizeDeg(lon) / 30);

  return {
    sign: SIGNS[idx],
    signIdx: idx,
  };
}

function nakshatraFromLon(lon) {
  const size = 360 / 27;

  const idx = Math.floor(normalizeDeg(lon) / size);

  return {
    nakshatra: NAKSHATRAS[idx],
    nakshatraIdx: idx,
  };
}

function calculateHouse(signIdx, lagnaIdx) {
  return ((signIdx - lagnaIdx + 12) % 12) + 1;
}

// --------------------------------------
// BASIC GUNA MILAN
// --------------------------------------

function calculateGunaMilan(boyMoonIdx, girlMoonIdx) {

  const diff = Math.abs(boyMoonIdx - girlMoonIdx);

  const varna = diff <= 3 ? 1 : 0;

  const vashya = diff <= 5 ? 2 : 1;

  const tara = diff % 2 === 0 ? 3 : 1.5;

  const yoni = diff <= 7 ? 4 : 2;

  const grahaMaitri = diff <= 4 ? 5 : 3;

  const gana = diff <= 8 ? 6 : 3;

   const bhakoot = diff !== 6 ? 7 : 0;

  const nadi = diff !== 0 ? 8 : 0;

  const total =
    varna +
    vashya +
    tara +
    yoni +
    grahaMaitri +
    gana +
    bhakoot +
    nadi;

  return {
    varna,
    vashya,
    tara,
    yoni,
    grahaMaitri,
    gana,
    bhakoot,
    nadi,
    total,
  };
}

// --------------------------------------
// MANGAL DOSHA
// --------------------------------------

function isManglik(marsHouse) {
  return [1, 2, 4, 7, 8, 12].includes(marsHouse);
}

// --------------------------------------
// TATTVA COMPATIBILITY
// --------------------------------------

function tattvaCompatibility(a, b) {

  if (a === b) {
    return {
      score: 95,
      summary: 'Excellent elemental harmony.',
    };
  }
   const goodPairs = [
    ['Fire', 'Air'],
    ['Earth', 'Water'],
  ];

  const isGood = goodPairs.some(
    pair =>
      pair.includes(a) &&
      pair.includes(b)
  );

  if (isGood) {
    return {
      score: 80,
      summary: 'Strong elemental compatibility.',
    };
  }

  return {
    score: 60,
    summary: 'Moderate elemental compatibility requiring understanding.',
  };
}

// --------------------------------------
// MAIN ENGINE
// --------------------------------------

async function buildCompatibility(data) {

  const boyChart = await calculateChart(data.boy);

  const girlChart = await calculateChart(data.girl);

  const boyMoonLon = boyChart.planets.Moon.longitude;
  const girlMoonLon = girlChart.planets.Moon.longitude;

  const boyMoon = signFromLon(boyMoonLon);
  const girlMoon = signFromLon(girlMoonLon);

  const boyNak = nakshatraFromLon(boyMoonLon);
  const girlNak = nakshatraFromLon(girlMoonLon);

  const boyLagna = signFromLon(boyChart.ascendant);
  const girlLagna = signFromLon(girlChart.ascendant);

  // ----------------------------------
  // GUNA MILAN
  // ----------------------------------

  const guna = calculateGunaMilan(
    boyNak.nakshatraIdx,
    girlNak.nakshatraIdx
  );

  // ----------------------------------
  // MANGAL DOSHA
  // ----------------------------------

  const boyMars = signFromLon(
    boyChart.planets.Mars.longitude
  );
  const girlMars = signFromLon(
    girlChart.planets.Mars.longitude
  );

  const boyMarsHouse = calculateHouse(
    boyMars.signIdx,
    boyLagna.signIdx
  );

  const girlMarsHouse = calculateHouse(
    girlMars.signIdx,
    girlLagna.signIdx
  );

   const boyManglik = isManglik(boyMarsHouse);

  const girlManglik = isManglik(girlMarsHouse);

  // ----------------------------------
  // TATTVA
  // ----------------------------------

  const boyElement = TATTVA[boyMoon.sign];

  const girlElement = TATTVA[girlMoon.sign];

  const tattva = tattvaCompatibility(
    boyElement,
    girlElement
  );

  // ----------------------------------
  // OVERALL SCORE
  // ----------------------------------

  let overall = Math.round(
    guna.total * 2 + tattva.score * 0.3
  );

  if (boyManglik !== girlManglik) {
    overall -= 10;
  }

  overall = Math.max(0, Math.min(100, overall));

  // ----------------------------------
  // RECOMMENDATION
   // ----------------------------------

  let recommendation = 'Good Match';

  if (overall >= 85) {
    recommendation = 'Excellent Match';
  } else if (overall >= 70) {
    recommendation = 'Very Good Match';
  } else if (overall >= 55) {
    recommendation = 'Average Match';
  } else {
     recommendation = 'Needs Careful Consideration';
  }

  // ----------------------------------
  // EMOTIONAL
  // ----------------------------------


  const emotionalCompatibility =
    guna.grahaMaitri >= 4
      ? 'Strong emotional understanding and communication.'
      : 'Requires emotional maturity and patience.';

  // ----------------------------------
  // FINAL RESPONSE
  // ----------------------------------

  return {

    overall_score: overall,

    recommendation,

    guna_milan: {
      total: guna.total,
      out_of: 36,
      details: guna,
    },
     moon_compatibility: {
      boy: {
        sign: boyMoon.sign,
        nakshatra: boyNak.nakshatra,
      },
      girl: {
        sign: girlMoon.sign,
        nakshatra: girlNak.nakshatra,
      },
    },

    tattva_compatibility: {
      boy_element: boyElement,
      girl_element: girlElement,
      score: tattva.score,
      summary: tattva.summary,
    },

     mangal_dosha: {
      boy: boyManglik,
      girl: girlManglik,
      compatible:
        boyManglik === girlManglik,
      summary:
        boyManglik === girlManglik
          ? 'Manglik energies are balanced.'
          : 'Manglik imbalance may require remedies.',
    },

    emotional_compatibility:
      emotionalCompatibility,

    strengths: [
      'Good mutual understanding',
      'Supportive communication patterns',
      'Strong long-term growth potential',
    ],

    challenges: [
      'Needs patience during emotional conflicts',
      'Differences in decision-making style',
    ],
     remedies: [
      'Chant Om Namah Shivaya regularly',
      'Offer prayers to Lord Vishnu on Thursdays',
      'Maintain open communication and trust',
    ],
  };
}

// --------------------------------------
// ROUTE
// --------------------------------------

// ✅ Auth required: user must be logged in to use compatibility check
router.post('/compatibility', authenticateCustomer, async (req, res) => {

  try {
    const result = await buildCompatibility(req.body);

    // ✅ Save compatibility result to database
    try {
      const user = req.user;
      const { boy, girl } = req.body;

      await CompatibilityResult.create({
        userId: user._id || user.id,
        userName: user.name || 'User',
        userEmail: user.email,
        userPhone: user.phone || null,
        boyDetails: {
          name: boy.name || null,
          dateOfBirth: boy.dateOfBirth || null,
          timeOfBirth: boy.timeOfBirth || null,
          placeOfBirth: boy.placeOfBirth || null,
          latitude: boy.lat ? parseFloat(boy.lat) : null,
          longitude: boy.lon ? parseFloat(boy.lon) : null,
          timezone: boy.timezone ? parseFloat(boy.timezone) : 5.5,
        },
        girlDetails: {
          name: girl.name || null,
          dateOfBirth: girl.dateOfBirth || null,
          timeOfBirth: girl.timeOfBirth || null,
          placeOfBirth: girl.placeOfBirth || null,
          latitude: girl.lat ? parseFloat(girl.lat) : null,
          longitude: girl.lon ? parseFloat(girl.lon) : null,
          timezone: girl.timezone ? parseFloat(girl.timezone) : 5.5,
        },
        compatibilityResult: result,
        overallScore: result.overall_score,
        recommendation: result.recommendation,
        gunaMilanTotal: result.guna_milan?.total || null,
      });

      console.log('✅ Compatibility result saved to DB for user: ' + user.email);
    } catch (dbErr) {
      console.error('CompatibilityResult DB save error:', dbErr.message);
    }

    res.json({
      success: true,
      compatibility: result,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;