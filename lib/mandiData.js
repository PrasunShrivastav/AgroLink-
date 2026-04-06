export const BASE_PRICES = {
  Wheat:      { base: 2180, unit: 'quintal', mandi: 'Hapur, UP' },
  Rice:       { base: 3250, unit: 'quintal', mandi: 'Karnal, Haryana' },
  Onion:      { base: 1820, unit: 'quintal', mandi: 'Lasalgaon, MH' },
  Tomato:     { base: 1450, unit: 'quintal', mandi: 'Nashik, MH' },
  Sugarcane:  { base: 355,  unit: 'quintal', mandi: 'Kolhapur, MH' },
  Soybean:    { base: 4600, unit: 'quintal', mandi: 'Indore, MP' },
}

export const SEVEN_DAY_HISTORY = {
  Wheat:     [2100, 2130, 2110, 2160, 2145, 2170, 2180],
  Rice:      [3180, 3200, 3220, 3190, 3240, 3230, 3250],
  Onion:     [1700, 1740, 1780, 1800, 1790, 1810, 1820],
  Tomato:    [1600, 1550, 1500, 1480, 1460, 1440, 1450],
  Sugarcane: [340,  345,  348,  350,  352,  354,  355],
  Soybean:   [4500, 4520, 4540, 4560, 4580, 4590, 4600],
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today']

export function fluctuate(price) {
  const swing = (Math.random() - 0.48) * 0.006 * price
  return Math.round(price + swing)
}

export function calcChange(oldPrice, newPrice) {
  const diff = newPrice - oldPrice
  const pct = ((diff / oldPrice) * 100).toFixed(2)
  return { diff, pct, direction: diff >= 0 ? 'up' : 'down' }
}
