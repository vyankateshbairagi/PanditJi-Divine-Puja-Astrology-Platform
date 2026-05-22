const express = require('express');
const router = express.Router();
const FreeAstroRequest = require('../models/FreeAstroRequest');
const BirthChartResult = require('../models/BirthChartResult');
const { authenticateCustomer } = require('../middleware/auth');

const {
  normalizeDeg,
  isCombust,
  COMBUST_LIMITS,
} = require('../utils/astronomy');
const {
  calculateChart,
} = require('../services/swissEphService');

// ─── Lookup tables ────────────────────────────────────────────────────────────

const RASHI_NAMES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
  'Simha', 'Kanya', 'Tula', 'Vrischika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const RASHI_ENGLISH = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
  'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
  'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

// 27 Panchang Yogas (Sun longitude + Moon longitude, each 13°20' = 800')
const PANCHANG_YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

// 11 Karanas (half-tithi)
const KARANA_NAMES = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja',
  'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kinstughna',
];

const DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10,
  Mars: 7, Rahu: 18, Jupiter: 16,
  Saturn: 19, Mercury: 17,
};

const EXALTATION = {
  Sun: 'Mesha', Moon: 'Vrishabha', Mars: 'Makara',
  Mercury: 'Kanya', Jupiter: 'Karka',
  Venus: 'Meena', Saturn: 'Tula',
};

const DEBILITATION = {
  Sun: 'Tula', Moon: 'Vrischika', Mars: 'Karka',
  Mercury: 'Meena', Jupiter: 'Makara',
  Venus: 'Kanya', Saturn: 'Mesha',
};

const OWN_SIGNS = {
  Sun: ['Simha'],
  Moon: ['Karka'],
  Mars: ['Mesha', 'Vrischika'],
  Mercury: ['Mithuna', 'Kanya'],
  Jupiter: ['Dhanu', 'Meena'],
  Venus: ['Vrishabha', 'Tula'],
  Saturn: ['Makara', 'Kumbha'],
};

// Planets that own each sign (index 0=Mesha..11=Meena)
const SIGN_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon',
  'Sun', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

const SIGN_TO_IDX = {
  Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3,
  Leo: 4, Virgo: 5, Libra: 6, Scorpio: 7,
  Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
};

// ─── Pure calculation helpers ─────────────────────────────────────────────────

function signFromLon(lon) {
  if (typeof lon !== 'number' || isNaN(lon)) {
    return {
      signIdx: 0,
      sign: 'Unknown',
      english: 'Unknown',
      degree: 0,
    };
  }

  const idx = Math.floor(normalizeDeg(lon) / 30);
  return {
    signIdx: idx,
    sign: RASHI_NAMES[idx],
    english: RASHI_ENGLISH[idx],
    degree: normalizeDeg(lon) % 30,
  };
}

function nakshatraFromLon(lon) {
  const NAK_DIV = 360 / 27;
  const normed = normalizeDeg(lon);
  const idx = Math.floor(normed / NAK_DIV);
  const pada = Math.floor((normed % NAK_DIV) / (NAK_DIV / 4)) + 1;
  return { nakshatra: NAKSHATRAS[idx], pada, nakshatraIndex: idx };
}

function toDMS(deg) {
  const d = Math.floor(deg);
  const mf = (deg - d) * 60;
  const m = Math.floor(mf);
  const s = Math.floor((mf - m) * 60);
  return `${d}° ${m}' ${s}"`;
}

function planetStrength(name, sign) {
  if (EXALTATION[name] === sign) return 'Exalted';
  if (DEBILITATION[name] === sign) return 'Debilitated';
  if ((OWN_SIGNS[name] || []).includes(sign)) return 'Own Sign';
  return 'Neutral';
}

function navamsaSign(lon) {
  const normed = normalizeDeg(lon);
  const signIdx = Math.floor(normed / 30);
  const degInSign = normed % 30;
  const navPart = Math.floor(degInSign / (30 / 9));

  const NAVAMSA_START = [0, 9, 6, 3];
  const start = NAVAMSA_START[signIdx % 4];
  return RASHI_NAMES[(start + navPart) % 12];
}

// ─── Panchang Yoga calculation ────────────────────────────────────────────────

function calcPanchangYoga(sunLon, moonLon) {
  const combined = normalizeDeg(sunLon + moonLon);
  const yogaIdx = Math.floor(combined / (360 / 27));
  return PANCHANG_YOGA_NAMES[yogaIdx % 27];
}

// ─── Karana calculation ───────────────────────────────────────────────────────

function calcKarana(sunLon, moonLon) {
  const diff = normalizeDeg(moonLon - sunLon);
  const karanaNo = Math.floor(diff / 6); // 0-based, 0..59

  // First karana of Shukla Pratipada is Kinstughna (fixed)
  if (karanaNo === 0) return 'Kinstughna';

  // Last karana of Krishna Chaturdashi is Kinstughna; before that Chatushpada, Naga, Shakuni
  if (karanaNo >= 57) {
    const fixed = ['Shakuni', 'Chatushpada', 'Naga', 'Kinstughna'];
    return fixed[karanaNo - 57] || 'Kinstughna';
  }

  // Repeating 7 movable karanas cycle
  const movable = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'];
  return movable[(karanaNo - 1) % 7];
}

// ─── D9 (Navamsa) Lagna ───────────────────────────────────────────────────────

function calcD9Lagna(lagnaLon) {
  return navamsaSign(lagnaLon);
}


function getHouseFromLongitude(longitude, houseCusps) {

  for (let i = 0; i < 12; i++) {

    const start = houseCusps[i];
    const end = houseCusps[(i + 1) % 12];

    if (start < end) {
      if (longitude >= start && longitude < end) {
        return i + 1;
      }
    } else {
      // wrap around 360°
      if (longitude >= start || longitude < end) {
        return i + 1;
      }
    }
  }

  return 1;
}

// ─── Antardasha list ──────────────────────────────────────────────────────────

/**
 * Generates the full antardasha sequence within a given mahadasha.
 * The sub-period starts from the same lord as the mahadasha,
 * following the standard Vimshottari cycle.
 * Returns array of { lord, years } objects.
 */
function calcAntardashaList(mahadashaLord, mahadashaYears) {
  const startIdx = DASHA_SEQUENCE.indexOf(mahadashaLord);
  const list = [];
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQUENCE[(startIdx + i) % 9];
    const subYears = parseFloat(
      ((mahadashaYears * DASHA_YEARS[lord]) / 120).toFixed(2)
    );
    list.push({ lord, years: subYears });
  }
  return list;
}

// ─── Yoga calculations ────────────────────────────────────────────────────────

function calcYogas(planets, houses, lagnaIdx) {
  const yogas = [];

  // Helper: get planet object by name
  const p = (name) => planets.find(pl => pl.name === name);

  // House of a planet
  const houseOf = (name) => p(name)?.house;

  // Sign index of a planet (0=Mesha)
  const signIdxOf = (name) => {
    const pl = p(name);
    return pl ? RASHI_NAMES.indexOf(pl.sign) : -1;
  };

  // Check if two planets are in mutual aspect (same or opposite houses roughly)
  const conjunct = (a, b) => houseOf(a) === houseOf(b);
  const isIn7th = (a, b) => {
    const ha = houseOf(a), hb = houseOf(b);
    return ha && hb && Math.abs(ha - hb) === 6;
  };
  const aspectedBy = (planetName, aspecter) => {
    const ha = houseOf(aspecter);
    const hb = houseOf(planetName);
    if (!ha || !hb) return false;
    // 7th aspect (all planets)
    if (((ha - hb + 12) % 12) === 6 || ((hb - ha + 12) % 12) === 6) return true;
    // Saturn: 3rd, 10th
    if (aspecter === 'Saturn' && (((ha - hb + 12) % 12) === 2 || ((ha - hb + 12) % 12) === 9)) return true;
    // Jupiter: 5th, 9th
    if (aspecter === 'Jupiter' && (((ha - hb + 12) % 12) === 4 || ((ha - hb + 12) % 12) === 8)) return true;
    // Mars: 4th, 8th
    if (aspecter === 'Mars' && (((ha - hb + 12) % 12) === 3 || ((ha - hb + 12) % 12) === 7)) return true;
    return false;
  };

  const moon = p('Moon');
  const jup = p('Jupiter');
  const sun = p('Sun');
  const mer = p('Mercury');
  const ven = p('Venus');
  const mars = p('Mars');
  const sat = p('Saturn');
  const rahu = p('Rahu');
  const ketu = p('Ketu');

  // 1. Gaja Kesari Yoga — Jupiter in kendra (1,4,7,10) from Moon
  const kendraFromMoon = moon && jup
    ? [1, 4, 7, 10].includes(((jup.house - moon.house + 12) % 12) + 1)
    : false;
  yogas.push({
    name: 'Gaja Kesari Yoga',
    present: kendraFromMoon,
    description: kendraFromMoon
      ? `Jupiter (H${jup.house}) is in kendra from Moon (H${moon.house}), bestowing wisdom, fame, and prosperity.`
      : 'Jupiter not in kendra from Moon.',
  });

  // 2. Budha-Aditya Yoga — Sun and Mercury in same house
  const buddhaAditya = sun && mer && conjunct('Sun', 'Mercury');
  yogas.push({
    name: 'Budha-Aditya Yoga',
    present: !!buddhaAditya,
    description: buddhaAditya
      ? `Sun and Mercury are conjunct in House ${houseOf('Sun')}, giving sharp intellect, fame, and excellent communication.`
      : 'Sun and Mercury not conjunct.',
  });

  // 3. Hamsa Yoga — Jupiter in own/exalted sign AND in kendra (1,4,7,10)
  const jupKendra = jup && [1, 4, 7, 10].includes(jup.house);
  const jupStrong = jup && (jup.strength === 'Exalted' || jup.strength === 'Own Sign');
  const hamsa = jupKendra && jupStrong;
  yogas.push({
    name: 'Hamsa Yoga',
    present: !!hamsa,
    description: hamsa
      ? `Jupiter is in ${jup.sign} (${jup.strength}) in House ${jup.house} (kendra), bestowing wisdom and spiritual grace.`
      : 'Jupiter not in own/exalted sign in kendra.',
  });

  // 4. Malavya Yoga — Venus in own/exalted sign AND in kendra
  const venKendra = ven && [1, 4, 7, 10].includes(ven.house);
  const venStrong = ven && (ven.strength === 'Exalted' || ven.strength === 'Own Sign');
  const malavya = venKendra && venStrong;
  yogas.push({
    name: 'Malavya Yoga',
    present: !!malavya,
    description: malavya
      ? `Venus is in ${ven.sign} (${ven.strength}) in House ${ven.house} (kendra), bringing beauty, luxury, and marital bliss.`
      : 'Venus not in own/exalted sign in kendra.',
  });

  // 5. Shasha Yoga — Saturn in own/exalted AND in kendra
  const satKendra = sat && [1, 4, 7, 10].includes(sat.house);
  const satStrong = sat && (sat.strength === 'Exalted' || sat.strength === 'Own Sign');
  const shasha = satKendra && satStrong;
  yogas.push({
    name: 'Shasha Yoga',
    present: !!shasha,
    description: shasha
      ? `Saturn is in ${sat.sign} (${sat.strength}) in House ${sat.house} (kendra), giving authority and long-lasting achievements.`
      : 'Saturn not in own/exalted sign in kendra.',
  });

  // 6. Ruchaka Yoga — Mars in own/exalted AND in kendra
  const marsKendra = mars && [1, 4, 7, 10].includes(mars.house);
  const marsStrong = mars && (mars.strength === 'Exalted' || mars.strength === 'Own Sign');
  const ruchaka = marsKendra && marsStrong;
  yogas.push({
    name: 'Ruchaka Yoga',
    present: !!ruchaka,
    description: ruchaka
      ? `Mars is in ${mars.sign} (${mars.strength}) in House ${mars.house} (kendra), conferring courage, leadership, and physical strength.`
      : 'Mars not in own/exalted sign in kendra.',
  });

  // 7. Dhana Yoga — Lords of 2nd and 11th conjunct or in each other's signs
  const lord2 = SIGN_LORDS[(lagnaIdx + 1) % 12];
  const lord11 = SIGN_LORDS[(lagnaIdx + 10) % 12];
  const dhana = conjunct(lord2, lord11) ||
    (p(lord2)?.house === houseOf(lord11)) ||
    (houseOf(lord2) === 11) || (houseOf(lord11) === 2);
  yogas.push({
    name: 'Dhana Yoga',
    present: !!dhana,
    description: dhana
      ? `Lords of 2nd (${lord2}) and 11th (${lord11}) houses are connected, indicating financial prosperity.`
      : 'No significant wealth yoga from 2nd/11th lords.',
  });

  // 8. Raja Yoga — Lords of kendra and trikona conjunct or aspecting each other
  const kendraHouses = [1, 4, 7, 10];
  const trikonaHouses = [1, 5, 9];
  const kendraLords = kendraHouses.map(h => SIGN_LORDS[(lagnaIdx + h - 1) % 12]);
  const trikonaLords = trikonaHouses.map(h => SIGN_LORDS[(lagnaIdx + h - 1) % 12]);
  let rajaYogaFound = false;
  let rajaDesc = '';
  for (const kl of kendraLords) {
    for (const tl of trikonaLords) {
      if (kl !== tl && (conjunct(kl, tl) || aspectedBy(kl, tl) || aspectedBy(tl, kl))) {
        rajaYogaFound = true;
        rajaDesc = `${kl} (kendra lord) and ${tl} (trikona lord) are connected, giving high status, authority, and success.`;
        break;
      }
    }
    if (rajaYogaFound) break;
  }
  yogas.push({
    name: 'Raja Yoga',
    present: rajaYogaFound,
    description: rajaDesc || 'No strong Raja Yoga combination found.',
  });

  // 9. Kaal Sarp Yoga — all planets between Rahu and Ketu
  const rahuLon = rahu ? normalizeDeg((rahu.house - 1) * 30 + (rahu.degree || 0)) : null;
  const ketuLon = ketu ? normalizeDeg((ketu.house - 1) * 30 + (ketu.degree || 0)) : null;
  let allBetween = false;
  if (rahuLon !== null && ketuLon !== null) {
    const classicalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    allBetween = classicalPlanets.every(name => {
      const pl = p(name);
      if (!pl) return true;
      const lon = normalizeDeg((pl.house - 1) * 30 + (pl.degree || 0));
      // Check if lon is between Rahu and Ketu (going from Rahu forward to Ketu)
      let start = rahuLon, end = ketuLon;
      if (start > end) {
        return lon >= start || lon <= end;
      }
      return lon >= start && lon <= end;
    });
  }
  yogas.push({
    name: 'Kaal Sarp Yoga',
    present: allBetween,
    description: allBetween
      ? 'All planets are hemmed between Rahu and Ketu, indicating delays and karmic lessons, but also great spiritual potential.'
      : 'Planets are not all hemmed between Rahu and Ketu.',
  });

  // 10. Viparita Raja Yoga — lord of 6, 8, or 12 in another of these houses
  const dushthanaHouses = [6, 8, 12];
  const dushthanaLords = dushthanaHouses.map(h => SIGN_LORDS[(lagnaIdx + h - 1) % 12]);
  let vipRaja = false;
  let vipDesc = '';
  for (const dl of dushthanaLords) {
    const plDl = p(dl);
    if (plDl && dushthanaHouses.includes(plDl.house) && !dushthanaHouses.includes(
      dushthanaHouses[dushthanaLords.indexOf(dl)]
    )) {
      // Lord of dusthana placed in another dusthana
      vipRaja = true;
      vipDesc = `${dl} (dusthana lord) is in House ${plDl.house}, creating Viparita Raja Yoga — challenges transform into success.`;
      break;
    }
  }
  yogas.push({
    name: 'Viparita Raja Yoga',
    present: vipRaja,
    description: vipDesc || 'No Viparita Raja Yoga found.',
  });

  return yogas;
}

// ─── Dosha calculations ───────────────────────────────────────────────────────

function calcDoshas(planets, houses, lagnaIdx) {
  const doshas = [];
  const p = (name) => planets.find(pl => pl.name === name);
  const houseOf = (name) => p(name)?.house;

  // 1. Mangal Dosha (Kuja Dosha) — Mars in 1,2,4,7,8,12
  const marsH = houseOf('Mars');
  const mangalPresent = [1, 2, 4, 7, 8, 12].includes(marsH);
  let mangalSeverity = 'Low';
  if ([7, 8].includes(marsH)) mangalSeverity = 'High';
  else if ([1, 4, 12].includes(marsH)) mangalSeverity = 'Medium';
  doshas.push({
    name: 'Mangal Dosha (Kuja Dosha)',
    present: mangalPresent,
    severity: mangalSeverity,
    description: mangalPresent
      ? `Mars is placed in House ${marsH}, creating Mangal Dosha. This may affect marital harmony.`
      : 'Mars is not in a Mangal Dosha-causing house (1,2,4,7,8,12). No Mangal Dosha.',
    remedies: mangalPresent ? [
      'Perform Mangal puja on Tuesdays',
      'Chant "Om Angarakaya Namaha" 108 times daily',
      'Marry someone with equivalent Mangal Dosha (cancellation)',
      'Donate red lentils (masoor dal) on Tuesdays',
      'Wear coral (moonga) gemstone after consulting an astrologer',
    ] : [],
  });

  // 2. Kaal Sarp Dosha — all 7 classical planets between Rahu and Ketu
  const rahu = p('Rahu');
  const ketu = p('Ketu');
  const rahuH = houseOf('Rahu');
  const ketuH = houseOf('Ketu');
  const classicalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  let kaalsarpPresent = false;
  if (rahu && ketu) {
    // Check house-based: all classical planets must be in the arc from Rahu to Ketu
    const start = rahuH, end = ketuH;
    kaalsarpPresent = classicalPlanets.every(name => {
      const h = houseOf(name);
      if (!h) return true;
      // Arc from Rahu house to Ketu house going forward
      if (start < end) return h >= start && h <= end;
      return h >= start || h <= end;
    });
  }
  let ksType = '';
  if (kaalsarpPresent && rahuH) {
    const ksNames = ['', 'Anant', 'Kulik', 'Vasuki', 'Shankhapala', 'Padma', 'Mahapadma',
      'Takshak', 'Karkotak', 'Shankhachud', 'Ghatak', 'Vishdhar', 'Sheshnag'];
    ksType = ksNames[rahuH] || '';
  }
  doshas.push({
    name: 'Kaal Sarp Dosha',
    present: kaalsarpPresent,
    severity: kaalsarpPresent ? (rahuH >= 7 ? 'High' : 'Medium') : 'Low',
    description: kaalsarpPresent
      ? `${ksType ? ksType + ' ' : ''}Kaal Sarp Dosha is present (Rahu in H${rahuH}, Ketu in H${ketuH}). All planets are hemmed. Indicates delays, obstacles, and karmic tests.`
      : 'No Kaal Sarp Dosha — planets are not all hemmed between Rahu and Ketu.',
    remedies: kaalsarpPresent ? [
      'Perform Kaal Sarp Dosha puja at Trimbakeshwar or Ujjain',
      'Chant "Om Namah Shivaya" 108 times daily',
      'Offer milk to a Shiva Linga on Mondays',
      'Wear a serpent-shaped silver ring on the little finger',
      'Donate black sesame seeds on Saturdays',
    ] : [],
  });

  // 3. Pitra Dosha — Sun afflicted by Rahu/Ketu or Sun/Moon in 9th with malefics
  const sun = p('Sun');
  const moon = p('Moon');
  const sunH = houseOf('Sun');
  const moonH = houseOf('Moon');
  const rahuConjSun = rahuH === sunH;
  const ketuConjSun = ketuH === sunH;
  const rahuIn9 = rahuH === 9;
  const sunIn9 = sunH === 9;
  const pitraPresent = rahuConjSun || ketuConjSun || (rahuIn9 && sunIn9);
  doshas.push({
    name: 'Pitra Dosha',
    present: pitraPresent,
    severity: pitraPresent ? (rahuConjSun ? 'High' : 'Medium') : 'Low',
    description: pitraPresent
      ? `${rahuConjSun ? 'Rahu conjunct Sun' : ketuConjSun ? 'Ketu conjunct Sun' : 'Rahu and Sun in 9th house'} indicates Pitra Dosha — karmic debt to ancestors affecting life progression.`
      : 'No significant Pitra Dosha indicators found.',
    remedies: pitraPresent ? [
      'Perform Pitru Tarpan on Amavasya (new moon) days',
      'Offer food to crows on Saturdays',
      'Donate food on Pitru Paksha (16-day lunar period)',
      'Recite Pitru Stotram or Gayatri Mantra 108 times at sunrise',
      'Perform Shraddha ritual for ancestors annually',
    ] : [],
  });

  // 4. Shani Sade-Sati — Saturn transiting 12th, 1st, or 2nd from Moon sign
  // (We use natal Saturn position as a simplified indicator)
  const satH = houseOf('Saturn');
  const moonSignIdx = moon ? RASHI_NAMES.indexOf(moon.sign) : -1;
  const satSignIdx = p('Saturn') ? RASHI_NAMES.indexOf(p('Saturn').sign) : -1;
  const sadeSati = moonSignIdx >= 0 && satSignIdx >= 0 &&
    [((moonSignIdx - 1 + 12) % 12), moonSignIdx, (moonSignIdx + 1) % 12].includes(satSignIdx);
  doshas.push({
    name: "Shani Sade-Sati (Natal Indicator)",
    present: sadeSati,
    severity: sadeSati ? 'Medium' : 'Low',
    description: sadeSati
      ? `Saturn (natal) is in ${p('Saturn')?.sign}, adjacent to Moon sign (${moon?.sign}), indicating a Sade-Sati period at birth — a time of karmic restructuring and life lessons.`
      : `Saturn (natal) in ${p('Saturn')?.sign} is not adjacent to Moon sign (${moon?.sign}). No natal Sade-Sati indicator.`,
    remedies: sadeSati ? [
      'Worship Lord Shani (Saturn) on Saturdays',
      'Chant "Om Sham Shanaischaraya Namaha" 108 times',
      'Donate black sesame, mustard oil, and iron on Saturdays',
      'Light sesame oil lamps at Shani temple on Saturdays',
      'Serve the elderly and underprivileged sincerely',
    ] : [],
  });

  // 5. Grahan Dosha — Sun or Moon conjunct Rahu or Ketu
  const sunGrahan = (rahuH === sunH || ketuH === sunH);
  const moonGrahan = (rahuH === moonH || ketuH === moonH);
  const grahanPresent = sunGrahan || moonGrahan;
  doshas.push({
    name: 'Grahan Dosha',
    present: grahanPresent,
    severity: grahanPresent ? ((sunGrahan && moonGrahan) ? 'High' : 'Medium') : 'Low',
    description: grahanPresent
      ? `${sunGrahan ? `Sun conjunct ${rahuH === sunH ? 'Rahu' : 'Ketu'} in H${sunH}` : ''}${sunGrahan && moonGrahan ? ' and ' : ''}${moonGrahan ? `Moon conjunct ${rahuH === moonH ? 'Rahu' : 'Ketu'} in H${moonH}` : ''} — Grahan Dosha affecting mental clarity and health.`
      : 'No Sun-Moon conjunction with Rahu or Ketu (no Grahan Dosha).',
    remedies: grahanPresent ? [
      'Chant Surya or Chandra mantra daily',
      'Perform Rahu/Ketu shanti puja',
      'Fast on eclipse days (Grahan)',
      'Donate wheat (for Sun) or rice (for Moon) to the needy',
      'Meditate and practice pranayama regularly',
    ] : [],
  });

  return doshas;
}

// ─── Strength scoring ─────────────────────────────────────────────────────────

/**
 * Calculate real astrological scores based on planet placements.
 * Each score is 0-100.
 */
function calcScores(planets, houses, lagnaIdx) {
  const p = (name) => planets.find(pl => pl.name === name);
  const houseOf = (name) => p(name)?.house;
  const strengthOf = (name) => p(name)?.strength || 'Neutral';

  const strengthScore = (name) => {
    const s = strengthOf(name);
    if (s === 'Exalted') return 100;
    if (s === 'Own Sign') return 85;
    if (s === 'Neutral') return 60;
    if (s === 'Debilitated') return 25;
    return 50;
  };

  const houseScore = (name, goodHouses, badHouses = [6, 8, 12]) => {
    const h = houseOf(name);
    if (!h) return 50;
    if (goodHouses.includes(h)) return 85;
    if (badHouses.includes(h)) return 30;
    return 60;
  };

  const clamp = (v) => Math.min(100, Math.max(0, Math.round(v)));

  // Overall strength — average of all planet strengths
  const allStrengths = planets.map(pl => strengthScore(pl.name));
  const overall_strength = clamp(allStrengths.reduce((a, b) => a + b, 0) / allStrengths.length);

  // Career — Sun, Saturn, Jupiter in good houses (1,9,10,11)
  const career_score = clamp(
    (strengthScore('Sun') * 0.30) +
    (strengthScore('Saturn') * 0.25) +
    (strengthScore('Jupiter') * 0.25) +
    (houseScore('Sun', [1, 9, 10, 11]) * 0.10) +
    (houseScore('Saturn', [1, 9, 10, 11]) * 0.10)
  );

  // Finance — Jupiter, Venus, Mercury in 2nd, 11th
  const finance_score = clamp(
    (strengthScore('Jupiter') * 0.30) +
    (strengthScore('Venus') * 0.25) +
    (strengthScore('Mercury') * 0.25) +
    (houseScore('Jupiter', [2, 5, 9, 11]) * 0.10) +
    (houseScore('Venus', [2, 5, 11]) * 0.10)
  );

  // Marriage — Venus, 7th house planets, Jupiter (for females)
  const h7Planets = (houses[7] || []).filter(n => n !== 'Lagna');
  const h7Good = h7Planets.some(n => ['Venus', 'Jupiter', 'Moon'].includes(n));
  const h7Bad = h7Planets.some(n => ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun'].includes(n));
  const marriage_score = clamp(
    (strengthScore('Venus') * 0.35) +
    (strengthScore('Jupiter') * 0.25) +
    (houseScore('Venus', [2, 4, 5, 7, 11]) * 0.20) +
    (h7Good ? 15 : h7Bad ? -15 : 0) + 20
  );

  // Health — Lagna lord, Sun, Moon
  const lagnaLordName = SIGN_LORDS[lagnaIdx];
  const health_score = clamp(
    (strengthScore(lagnaLordName) * 0.35) +
    (strengthScore('Sun') * 0.30) +
    (strengthScore('Moon') * 0.25) +
    (houseScore('Sun', [1, 4, 5, 9, 10]) * 0.10)
  );

  // Mental — Moon, Mercury
  const mental_score = clamp(
    (strengthScore('Moon') * 0.45) +
    (strengthScore('Mercury') * 0.35) +
    (houseScore('Moon', [1, 4, 5, 9]) * 0.10) +
    (houseScore('Mercury', [1, 4, 5, 9]) * 0.10)
  );

  // Spirituality — Jupiter, Ketu, 9th house, 12th house
  const h9Planets = (houses[9] || []).filter(n => n !== 'Lagna');
  const h12Planets = (houses[12] || []).filter(n => n !== 'Lagna');
  const spirituality_score = clamp(
    (strengthScore('Jupiter') * 0.30) +
    (houseScore('Jupiter', [1, 4, 5, 9, 12]) * 0.20) +
    (h9Planets.length > 0 ? 15 : 5) +
    (h12Planets.includes('Ketu') ? 20 : 10) +
    25
  );

  return {
    overall_strength,
    career_score,
    finance_score,
    marriage_score,
    health_score,
    mental_score,
    spirituality_score,
  };
}

// ─── Kundali builder ──────────────────────────────────────────────────────────

async function buildKundali(
  year,
  month,
  day,
  hour,
  minute,
  lat,
  lon,
  timezone = 5.5
) {

  const chart = await calculateChart({
    year,
    month,
    day,
    hour,
    minute,
    timezone,
    latitude: lat,
    longitude: lon,
  });

  const swissPlanets = chart.planets;

  const sid = {};

  Object.keys(swissPlanets).forEach(name => {
    sid[name] = swissPlanets[name].longitude;
  });

  const lagnaLon = chart.ascendant;
  const lagnaInfo = signFromLon(lagnaLon);
  const lagnaIdx = lagnaInfo.signIdx;


  const {
    calcMarriageYoga,
  } = require('../utils/marriageYoga');



  // 6. Build planet objects
  const planets = Object.keys(sid).map(name => {
    const rawLon = sid[name];
    const { signIdx, sign, english, degree } = signFromLon(rawLon);
    if (signIdx < 0 || lagnaIdx < 0) {
      console.log(name, signIdx, lagnaIdx);
    }
    const house = ((signIdx - lagnaIdx + 12) % 12) + 1;
    const { nakshatra, pada } = nakshatraFromLon(rawLon);

    // isRetrograde now accepts planet name directly (Swiss Ephemeris implementation)
    const retrograde = swissPlanets[name].retrograde;

    const combust = (name !== 'Sun' && name !== 'Rahu' && name !== 'Ketu' && COMBUST_LIMITS[name])
      ? isCombust(rawLon, sid.Sun, COMBUST_LIMITS[name])
      : false;
    console.log({
      planet: name,
      longitude: rawLon,
      signIdx,
      lagnaIdx,
      calculatedHouse: house,
      planetSign: sign,
      lagnaSign: lagnaInfo.sign,
    });

    return {
      name,
      sign,
      english,
      degree: parseFloat(degree.toFixed(4)),
      degreeDMS: toDMS(degree),
      house,
      nakshatra,
      pada,
      navamsa: navamsaSign(rawLon),
      strength: planetStrength(name, sign),
      retrograde,
      combust,
      rawLon,
    };
  });

  // 7. House occupation map
  const houses = {};
  for (let i = 1; i <= 12; i++) houses[i] = [];
  houses[1].push('Lagna');
  planets.forEach(pl => {
    if (houses[pl.house]) {
      houses[pl.house].push(pl.name);
    }
  });

  // 8. Panchang: Tithi
  const moonLon = sid.Moon;
  const sunLon = sid.Sun;
  const diff = normalizeDeg(moonLon - sunLon);
  const tithiNo = Math.min(Math.floor(diff / 12) + 1, 30);
  const tithiName = TITHI_NAMES[tithiNo - 1];
  const paksha = tithiNo <= 15 ? 'Shukla' : 'Krishna';

  // 9. Panchang Yoga (27 yogas)
  const yogaName = calcPanchangYoga(sunLon, moonLon);

  // 10. Karana
  const karanaName = calcKarana(sunLon, moonLon);

  // 11. Moon nakshatra
  const { nakshatra: moonNak, pada: moonNakPada } = nakshatraFromLon(moonLon);

  // 12. Vimshottari Mahadasha
  const NAK_DIV = 360 / 27;
  const nakIdx = Math.floor(normalizeDeg(moonLon) / NAK_DIV) % 27;
  const dashaLord = DASHA_SEQUENCE[nakIdx % 9];
  const nakProgress = (normalizeDeg(moonLon) % NAK_DIV) / NAK_DIV;
  const balance = parseFloat(((1 - nakProgress) * DASHA_YEARS[dashaLord]).toFixed(2));

  // 13. Antardasha list
  const antardasha_list = calcAntardashaList(dashaLord, DASHA_YEARS[dashaLord]);

  // 14. D9 Lagna
  const d9_lagna = calcD9Lagna(lagnaLon);

  // 15. D9 houses (simplified)
  const d9_houses = {};

  // 16. Yogas
  const yogaList = calcYogas(planets, houses, lagnaIdx);

  // 17. Doshas
  const doshaList = calcDoshas(planets, houses, lagnaIdx);

  // 18. Scores (real calculation)
  const scores = calcScores(planets, houses, lagnaIdx);
  const marriageYoga = calcMarriageYoga({
    planets,
    houses,
    lagnaIdx,
    mahadasha: dashaLord,
    antardasha_list,
  });

  return {
    lagna: lagnaInfo.sign,
    lagnaEnglish: lagnaInfo.english,
    lagnaDegree: toDMS(lagnaLon % 30),
    lagnaNakshatra: nakshatraFromLon(lagnaLon).nakshatra,
    lagnaPada: nakshatraFromLon(lagnaLon).pada,
    ayanamsa: parseFloat(chart.ayanamsa.toFixed(4)),

    planets: planets.map(({ rawLon, ...rest }) => rest),

    houses,

    tithi_number: tithiNo,
    tithi_name: tithiName,
    paksha,

    nakshatra: moonNak,
    nakshatra_pada: moonNakPada,

    yoga_name: yogaName,
    karana_name: karanaName,

    mahadasha: dashaLord,
    dasha_balance: `${balance} years`,
    dasha_balance_years: balance,

    antardasha_list,

    yogas: yogaList,

    doshas: doshaList,

    scores,

    d9_lagna,
    d9_houses,
    marriage_yoga: marriageYoga,

    julian_day: chart.jd,
  };
}

// ─── Daily horoscope generator ────────────────────────────────────────────────

async function generateHoroscope(signName) {

  const now = new Date();

  const chart = await calculateChart({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
    hour: now.getUTCHours(),
    minute: now.getUTCMinutes(),
    timezone: 0,
    latitude: 28.6139,   // Delhi default
    longitude: 77.2090,
  });

  const planets = chart.planets;

  const signBaseIdx = SIGN_TO_IDX[signName];

  const positions = {};

  Object.entries(planets).forEach(([name, pl]) => {

    const lon = pl.longitude;

    const {
      sign,
      signIdx,
      degree
    } = signFromLon(lon);

    positions[name] = {
      sign,
      degree: parseFloat(degree.toFixed(2)),
      house:
        ((signIdx - signBaseIdx + 12) % 12) + 1,
      nakshatra:
        nakshatraFromLon(lon).nakshatra,
      retrograde: pl.retrograde,
      strength: planetStrength(name, sign),
    };
  });

  const moon = positions.Moon;
  const sun = positions.Sun;
  const jupiter = positions.Jupiter;
  const saturn = positions.Saturn;

  // Basic interpretation engine
  const predictions = [];

  // Career
  if ([10, 11].includes(sun.house)) {
    predictions.push(
      'Career growth and recognition are favored today.'
    );
  } else if ([6, 8, 12].includes(sun.house)) {
    predictions.push(
      'Avoid workplace conflicts and unnecessary stress.'
    );
  }

  // Finance
  if ([2, 11].includes(jupiter.house)) {
    predictions.push(
      'Financial gains and opportunities are likely.'
    );
  }

  // Relationships
  if ([5, 7].includes(venusHouse(positions))) {
    predictions.push(
      'Relationships and emotional harmony improve today.'
    );
  }

  // Health
  if ([6, 8, 12].includes(saturn.house)) {
    predictions.push(
      'Take care of health and avoid overexertion.'
    );
  }


  const star_scores = {
    overall:
      sun.house === 10 ? 4.5 : 3.8,

    career:
      [10, 11].includes(sun.house)
        ? 4.4
        : 3.5,

    finance:
      [2, 11].includes(jupiter.house)
        ? 4.2
        : 3.2,

    love:
      [5, 7].includes(venusHouse(positions))
        ? 4.1
        : 3.0,

    health:
      [6, 8, 12].includes(saturn.house)
        ? 2.8
        : 4.0,

    luck:
      [9, 11].includes(jupiter.house)
        ? 4.3
        : 3.4,
  };


  const sections = {
    love:
      [5, 7].includes(venusHouse(positions))
        ? 'Romantic energy is favorable today. Emotional understanding improves.'
        : 'Be patient in relationships and avoid misunderstandings.',

    career:
      [10, 11].includes(sun.house)
        ? 'Career progress and recognition are strongly supported today.'
        : 'Focus on discipline and avoid workplace conflicts.',

    finance:
      [2, 11].includes(jupiter.house)
        ? 'Financial opportunities and gains are indicated.'
        : 'Avoid unnecessary expenses and risky investments.',

    health:
      [6, 8, 12].includes(saturn.house)
        ? 'Take care of stress, sleep, and digestion today.'
        : 'Health remains stable with balanced routines.',

    travel:
      [3, 9, 12].includes(moon.house)
        ? 'Travel and movement may bring beneficial experiences.'
        : 'Prefer stability and avoid unnecessary journeys today.',
  };
  return {
    sign: signName,

    date: now.toISOString().split('T')[0],

    tithi: 'Shukla Panchami',

    paksha: 'Shukla',

    moon_nakshatra: moon.nakshatra,

    overview:
      predictions[0] ||
      'Today brings balanced planetary energies and opportunities for growth.',

    planet_positions: positions,

    predictions,

    star_scores,

    sections,

    compatible_signs: [
      'Aries',
      'Leo',
      'Sagittarius',
    ],

    best_time: '10:30 AM - 12:00 PM',

    key_transits: [
      `Sun transiting ${sun.sign}`,
      `Moon influencing emotional clarity in ${moon.sign}`,
      `Jupiter supports wisdom and expansion`,
      `Saturn encourages discipline and patience`,
    ],

    mantra:
      'Om Gurave Namaha',

    lucky_color:
      getLuckyColor(signName),

    lucky_number:
      getLuckyNumber(signName),

    favorable_direction:
      getFavorableDirection(signName),
  };

}
// Helper 
function venusHouse(positions) {
  return positions?.Venus?.house || 0;
}

function getLuckyColor(sign) {

  const map = {
    Aries: 'Red',
    Taurus: 'White',
    Gemini: 'Green',
    Cancer: 'Silver',
    Leo: 'Gold',
    Virgo: 'Green',
    Libra: 'Pink',
    Scorpio: 'Maroon',
    Sagittarius: 'Yellow',
    Capricorn: 'Blue',
    Aquarius: 'Black',
    Pisces: 'Sea Green',
  };

  return map[sign] || 'White';
}

function getLuckyNumber(sign) {

  const map = {
    Aries: 9,
    Taurus: 6,
    Gemini: 5,
    Cancer: 2,
    Leo: 1,
    Virgo: 5,
    Libra: 6,
    Scorpio: 9,
    Sagittarius: 3,
    Capricorn: 8,
    Aquarius: 8,
    Pisces: 3,
  };

  return map[sign] || 1;
}

function getFavorableDirection(sign) {

  const map = {
    Aries: 'East',
    Taurus: 'South',
    Gemini: 'West',
    Cancer: 'North',
    Leo: 'East',
    Virgo: 'South',
    Libra: 'West',
    Scorpio: 'North',
    Sagittarius: 'East',
    Capricorn: 'South',
    Aquarius: 'West',
    Pisces: 'North',
  };

  return map[sign] || 'East';
}

// ─── Input validation ─────────────────────────────────────────────────────────

function validateKundaliInput({ dateOfBirth, timeOfBirth, lat, lon, timezone }) {
  const errors = [];

  if (!dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    errors.push('dateOfBirth must be in YYYY-MM-DD format');
  } else {
    const [y, m, d] = dateOfBirth.split('-').map(Number);
    if (y < 1900 || y > 2100) errors.push('Year must be between 1900 and 2100');
    if (m < 1 || m > 12) errors.push('Month must be 1–12');
    if (d < 1 || d > 31) errors.push('Day must be 1–31');
  }

  if (!timeOfBirth || !/^\d{2}:\d{2}$/.test(timeOfBirth)) {
    errors.push('timeOfBirth must be in HH:MM format');
  } else {
    const [h, min] = timeOfBirth.split(':').map(Number);
    if (h < 0 || h > 23) errors.push('Hour must be 0–23');
    if (min < 0 || min > 59) errors.push('Minute must be 0–59');
  }

  const latN = parseFloat(lat);
  const lonN = parseFloat(lon);
  if (lat == null || isNaN(latN) || latN < -90 || latN > 90) errors.push('lat must be -90 to 90');
  if (lon == null || isNaN(lonN) || lonN < -180 || lonN > 180) errors.push('lon must be -180 to 180');

  if (timezone != null) {
    const tz = parseFloat(timezone);
    if (isNaN(tz) || tz < -12 || tz > 14) errors.push('timezone must be between -12 and 14');
  }

  return errors;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/kundali', authenticateCustomer, async (req, res) => {
  try {
    const {
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      lat,
      lon,
      timezone = 5.5,
    } = req.body;

    const errors = validateKundaliInput({ dateOfBirth, timeOfBirth, lat, lon, timezone });
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join('; ') });
    }

    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const [hour, minute] = timeOfBirth.split(':').map(Number);

    const kundali = await buildKundali(
      year,
      month,
      day,
      hour,
      minute,
      parseFloat(lat),
      parseFloat(lon),
      parseFloat(timezone),
    );

    try {
      const user = req.user;
      const birthDetailsPayload = {
        fullName: name || null,
        dateOfBirth,
        timeOfBirth,
        placeOfBirth: placeOfBirth || null,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        timezone: parseFloat(timezone),
      };

      // Save request log (existing)
      await FreeAstroRequest.create({
        userId: user._id || user.id,
        userName: user.name || name || 'Native',
        userEmail: user.email,
        userPhone: user.phone || null,
        serviceType: 'kundli',
        serviceName: 'Free Kundali',
        birthDetails: birthDetailsPayload,
        status: 'delivered',
        deliveredAt: new Date(),
        adminNotes: 'Auto-generated via astronomy engine',
      });

      // Save full birth chart result to DB (new)
      await BirthChartResult.create({
        userId: user._id || user.id,
        userName: user.name || name || 'Native',
        userEmail: user.email,
        userPhone: user.phone || null,
        birthDetails: birthDetailsPayload,
        chartResult: kundali,
      });

      console.log('✅ Birth chart saved to DB for user: ' + user.email);
    } catch (dbErr) {
      console.error('BirthChart DB save error:', dbErr.message);
    }

    return res.json({
      success: true,
      name: name || 'Native',
      kundali,
    });

  } catch (err) {
    console.error('Kundali generation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/horoscope/:sign', async (req, res) => {
  try {
    const { sign } = req.params;

    if (!Object.prototype.hasOwnProperty.call(SIGN_TO_IDX, sign)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sign "${sign}". Must be one of: ${Object.keys(SIGN_TO_IDX).join(', ')}`,
      });
    }

    const horoscope = await generateHoroscope(sign);
    return res.json({ success: true, horoscope });

  } catch (err) {
    console.error('Horoscope error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
