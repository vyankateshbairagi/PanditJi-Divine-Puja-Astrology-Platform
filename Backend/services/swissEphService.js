const sweph = require('sweph');
const path = require('path');

sweph.set_ephe_path(
  path.join(__dirname, '../ephe')
);

// Lahiri ayanamsa
sweph.set_sid_mode(
  sweph.constants.SE_SIDM_LAHIRI,
  0,
  0
);

const PLANETS = {
  Sun: sweph.constants.SE_SUN,
  Moon: sweph.constants.SE_MOON,
  Mercury: sweph.constants.SE_MERCURY,
  Venus: sweph.constants.SE_VENUS,
  Mars: sweph.constants.SE_MARS,
  Jupiter: sweph.constants.SE_JUPITER,
  Saturn: sweph.constants.SE_SATURN,
  Rahu: sweph.constants.SE_MEAN_NODE,
};

function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}

function getJulianDay(data) {
  const ut =
    data.hour +
    data.minute / 60 -
    data.timezone;

  return sweph.julday(
    data.year,
    data.month,
    data.day,
    ut,
    sweph.constants.SE_GREG_CAL
  );
}

async function calculateChart(data) {

  const jd = getJulianDay(data);

  const flags =
    sweph.constants.SEFLG_SPEED |
    sweph.constants.SEFLG_SIDEREAL;

  const planets = {};

  for (const [name, body] of Object.entries(PLANETS)) {

    const result = sweph.calc_ut(
      jd,
      body,
      flags
    );
    

    const data = result.data || [];

planets[name] = {
  longitude: normalize(data[0] || 0),
  latitude: data[1] || 0,
  speed: data[3] || 0,
  retrograde: (data[3] || 0) < 0,
};
    console.log(name, result);
  }

  // Ketu
  planets.Ketu = {
    longitude: normalize(
      planets.Rahu.longitude + 180
    ),
    latitude: planets.Rahu.latitude,
    speed: planets.Rahu.speed,
    retrograde: planets.Rahu.retrograde,
  };

  // Houses
  const housesData = sweph.houses_ex(
  jd,
  sweph.constants.SEFLG_SIDEREAL,
  data.latitude,
  data.longitude,
  'P'
);

const tropicalAsc =
  housesData.data.points[0];

const ayanamsa =
  sweph.get_ayanamsa(jd);

const ascendant =
  normalize(housesData.data.points[0]);

const houses =
  housesData.data.houses;

return {
  jd,
  ayanamsa: sweph.get_ayanamsa(jd),
  ascendant,
  houses,
  planets,
};
}

module.exports = {
  calculateChart,
};