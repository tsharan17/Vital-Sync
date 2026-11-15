// Vital Sync engine. Pure functions, no DOM.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
// Combined insight modules: sleep debt, immune window, radiation, bone budget, readiness, cadence.
import { mean } from './analysis.js';

export function sleepDebt(log, day) {
  const s = log.filter(e => e.d <= day && e.d > day - 7 && e.v.sleep != null).map(e => e.v.sleep);
  return {nights: s.length, debt: s.reduce((t, h) => t + Math.max(0, 7 - h), 0), avg: s.length ? mean(s) : null};
}
export function immune(log, day, A) {
  const f = [], g = id => A.find(a => a.ind.id === id), d = sleepDebt(log, day);
  if (d.debt >= 3) f.push('Sleep debt of ' + d.debt.toFixed(1) + ' h over the last 7 nights');
  const m = g('mood'); if (m && !m.none && (m.val < 6 || (m.z < -1.5))) f.push('Mood below your baseline (3-day average ' + m.val.toFixed(1) + ')');
  const h = g('hr'); if (h && !h.none && h.z > 1.5) f.push('Resting heart rate above your baseline');
  const t = g('temp'); if (t && !t.none && t.z > 1.5) f.push('Body temperature above your baseline');
  return {factors: f, state: f.length >= 2 ? 2 : f.length};
}
export function radiation(day, mode) {
  const cum = day * mode.dose, proj = Math.max(day, mode.len) * mode.dose;
  return {cum, proj, limit: 600, pct: cum / 600, projPct: proj / 600};
}
export function bone(log, day) {
  const ex = log.filter(e => e.d <= day && e.d > day - 28 && e.ex != null).map(e => e.ex);
  const adh = ex.length ? Math.min(1, mean(ex) / 120) : 0, rate = 1.5 - adh, loss = rate * day / 30;
  return {adh, rate, loss, avg: ex.length ? mean(ex) : null};
}
export function readiness(A, log, day) {
  let s = 100; for (const a of A) s -= a.st === 2 ? 25 : a.st === 1 ? 12 : a.drift === 2 ? 10 : a.drift === 1 ? 5 : 0;
  s -= Math.min(15, sleepDebt(log, day).debt * 1.5);
  let streak = 0; const days = new Set(log.map(e => e.d)); for (let d = day; days.has(d); d--) streak++;
  return {score: Math.max(0, Math.round(s)), streak};
}
export const cadence = a => (a.level >= 2) ? ['Twice a day', 0.5] : a.level === 1 ? ['Every day', 1] : [a.ind.cad === 1 ? 'Every day' : 'Every ' + a.ind.cad + ' days', a.ind.cad];


// Spacecraft cabin environment. Limits follow common spacecraft practice; CO2 alert above 5.0 mmHg as specified for this app.
export const ENV = [
  { id: 'co2', name: 'Cabin carbon dioxide', unit: 'mmHg', dec: 1, nominal: [0, 3.0], caution: [0, 5.0], note: 'Raised carbon dioxide causes headaches and changes blood flow to the brain.' },
  { id: 'o2', name: 'Cabin oxygen', unit: '%', dec: 1, nominal: [19.9, 21.9], caution: [19.5, 23.5], note: 'Low oxygen impairs thinking; high oxygen raises fire risk.' },
  { id: 'rad', name: 'Radiation dose rate', unit: 'mSv/day', dec: 2, nominal: [0, 1.0], caution: [0, 2.0], note: 'A sudden rise points to a solar particle event: move to the shielded area.' },
  { id: 'temp', name: 'Cabin temperature', unit: '°C', dec: 1, nominal: [18.3, 26.7], caution: [16, 29], note: 'Outside the comfort band, sleep and concentration suffer.' },
  { id: 'rh', name: 'Cabin humidity', unit: '%', dec: 0, nominal: [25, 70], caution: [20, 75], note: 'Very dry air irritates eyes and airways; damp air feeds microbes.' }
];
export function envStatus(id, v) {
  const e = ENV.find(x => x.id === id);
  if (v >= e.nominal[0] && v <= e.nominal[1]) return 0;
  if (v >= e.caution[0] && v <= e.caution[1]) return 1;
  return 2;
}
// Simulated cabin telemetry for a mission day, seeded so the same day always shows the same values.
export function cabinTelemetry(day, mode, seed = 5) {
  let t = (day * 2654435761 + seed * 97) >>> 0;
  const r = () => { t += 0x6D2B79F5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const flare = r() < 0.03;
  const v = {
    co2: +(2.4 + (mode.co2 || 0) + 0.9 * r() + (day % 23 === 0 ? 2.4 : 0)).toFixed(1),
    o2: +(20.9 + (r() - 0.5) * 0.8).toFixed(1),
    rad: +(mode.dose * (0.85 + 0.3 * r()) * (flare ? 6 : 1)).toFixed(2),
    temp: +(22 + (r() - 0.5) * 3).toFixed(1),
    rh: Math.round(45 + (r() - 0.5) * 20)
  };
  return { v, flare, levels: Object.fromEntries(ENV.map(e => [e.id, envStatus(e.id, v[e.id])])) };
}

// Camera input: match the average colour of a photo region to the nearest swatch of a reference chart.
// Distance is measured in a simple perceptual space (weighted RGB), good enough to suggest a chart shade
// that the astronaut then confirms by eye.
export const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export function nearestSwatch(rgb, palette) {
  let best = 0, bd = Infinity;
  palette.forEach((hex, k) => {
    const [r, g, b] = hexRgb(hex), rm = (rgb[0] + r) / 2, dr = rgb[0] - r, dg = rgb[1] - g, db = rgb[2] - b;
    const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
    if (d < bd) { bd = d; best = k; }
  });
  return { index: best, distance: Math.sqrt(bd) };
}
export const URINE_CHART = ['#fbf6d0', '#f7ee9e', '#f1e36b', '#e9d33e', '#dcbb24', '#c99a1b', '#a8761a', '#7c5418'];
