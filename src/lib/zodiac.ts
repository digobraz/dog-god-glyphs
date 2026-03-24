const chineseAnimals = [
  { name: 'Monkey', emoji: '🐒' },
  { name: 'Rooster', emoji: '🐓' },
  { name: 'Dog', emoji: '🐕' },
  { name: 'Pig', emoji: '🐖' },
  { name: 'Rat', emoji: '🐀' },
  { name: 'Ox', emoji: '🐂' },
  { name: 'Tiger', emoji: '🐅' },
  { name: 'Rabbit', emoji: '🐇' },
  { name: 'Dragon', emoji: '🐉' },
  { name: 'Snake', emoji: '🐍' },
  { name: 'Horse', emoji: '🐎' },
  { name: 'Goat', emoji: '🐐' },
];

export function getChineseZodiac(year: number) {
  const idx = year % 12;
  return chineseAnimals[idx];
}

const westernSigns = [
  { name: 'Capricorn', emoji: '♑', startMonth: 1, startDay: 1, endMonth: 1, endDay: 19 },
  { name: 'Aquarius', emoji: '♒', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: 'Pisces', emoji: '♓', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: 'Aries', emoji: '♈', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: 'Taurus', emoji: '♉', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: 'Gemini', emoji: '♊', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: 'Cancer', emoji: '♋', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: 'Leo', emoji: '♌', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: 'Virgo', emoji: '♍', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: 'Libra', emoji: '♎', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: 'Scorpio', emoji: '♏', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: 'Sagittarius', emoji: '♐', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { name: 'Capricorn', emoji: '♑', startMonth: 12, startDay: 22, endMonth: 12, endDay: 31 },
];

export function getWesternZodiac(month: number, day: number) {
  for (const sign of westernSigns) {
    if (
      (month === sign.startMonth && day >= sign.startDay) ||
      (month === sign.endMonth && day <= sign.endDay)
    ) {
      return sign;
    }
  }
  return westernSigns[0]; // Capricorn fallback
}
