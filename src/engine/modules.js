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

