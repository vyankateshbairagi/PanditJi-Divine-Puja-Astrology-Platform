const RASHI_NAMES = [
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

const SIGN_LORDS = [
  'Mars',
  'Venus',
  'Mercury',
  'Moon',
  'Sun',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Saturn',
  'Jupiter',
];

const BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

function calcMarriageYoga({
  planets,
  houses,
  lagnaIdx,
  mahadasha,
  antardasha_list,
}) {

  const getPlanet = (name) =>
    planets.find(p => p.name === name);

  // -----------------------------------
  // 7th House
  // -----------------------------------

  const seventhHouse = 7;

  const seventhSignIdx =
    (lagnaIdx + 6) % 12;

  const seventhLord =
    SIGN_LORDS[seventhSignIdx];

  const seventhLordPlanet =
    getPlanet(seventhLord);

  // -----------------------------------
  // Venus
  // -----------------------------------

  const venus = getPlanet('Venus');

  // -----------------------------------
  // Strength score
  // -----------------------------------

  let score = 50;

  const reasons = [];

  if (
    seventhLordPlanet?.strength === 'Exalted'
  ) {
    score += 20;
    reasons.push(
      `${seventhLord} is exalted`
    );
  }

  if (
    seventhLordPlanet?.strength === 'Own Sign'
  ) {
    score += 15;
    reasons.push(
      `${seventhLord} is in own sign`
    );
  }

  if (
    venus?.strength === 'Exalted'
  ) {
    score += 15;
    reasons.push(
      'Venus is exalted'
    );
  }

  if (
    venus?.strength === 'Own Sign'
  ) {
    score += 10;
    reasons.push(
      'Venus is in own sign'
    );
  }

  // Benefics in 7th house

  const planetsIn7th =
    houses[7] || [];

  const beneficCount =
    planetsIn7th.filter(p =>
      BENEFICS.includes(p)
    ).length;

  score += beneficCount * 5;

  if (beneficCount > 0) {
    reasons.push(
      'Benefic planets influence 7th house'
    );
  }

  // Malefics

  const malefics =
    ['Saturn', 'Mars', 'Rahu', 'Ketu'];

  const maleficCount =
    planetsIn7th.filter(p =>
      malefics.includes(p)
    ).length;

  score -= maleficCount * 7;

  if (maleficCount > 0) {
    reasons.push(
      'Malefic influence on 7th house'
    );
  }

  // -----------------------------------
  // Marriage strength
  // -----------------------------------

  let strength = 'Average';

  if (score >= 85) {
    strength = 'Very Strong';
  } else if (score >= 70) {
    strength = 'Strong';
  } else if (score >= 55) {
    strength = 'Moderate';
  } else {
    strength = 'Delayed/Challenging';
  }

  // -----------------------------------
  // Marriage timing
  // -----------------------------------

  const favorableDashas = [];

  const marriagePlanets = [
    'Venus',
    seventhLord,
    'Jupiter',
  ];

  if (
    marriagePlanets.includes(mahadasha)
  ) {
    favorableDashas.push({
      period: `${mahadasha} Mahadasha`,
      reason:
        `${mahadasha} supports marriage`,
    });
  }

  antardasha_list.forEach(ad => {
    if (
      marriagePlanets.includes(ad.lord)
    ) {
      favorableDashas.push({
        period:
          `${mahadasha} / ${ad.lord}`,
        reason:
          `${ad.lord} antardasha favorable for marriage`,
      });
    }
  });

  // -----------------------------------
  // Marriage type
  // -----------------------------------

  let marriageType =
    'Possibility of arranged marriage';

  const venusHouse =
    venus?.house || 0;

  if (
    [5, 7].includes(venusHouse)
  ) {
    marriageType =
      'Strong possibility of love marriage';
  }

  // -----------------------------------
  // Delay indications
  // -----------------------------------

  const delays = [];

  if (
    planetsIn7th.includes('Saturn')
  ) {
    delays.push(
      'Saturn in 7th may delay marriage'
    );
  }

  if (
    planetsIn7th.includes('Rahu')
  ) {
    delays.push(
      'Rahu influence may create unconventional relationships'
    );
  }

  // -----------------------------------
  // Final response
  // -----------------------------------

  return {
    score,
    strength,
    reasons,
    marriage_type: marriageType,
    favorable_periods: favorableDashas,
    delay_indications: delays,
  };
}

module.exports = {
  calcMarriageYoga,
};
