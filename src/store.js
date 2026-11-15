// Local storage of crew profiles and their daily logs. Data never leaves the device.
import { simulate } from './engine/index.js';

const KEY = 'vital-sync-v1';
const pad = n => String(n).padStart(2, '0');
export const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => isoDate(new Date());
export const isoDaysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return isoDate(d); };

// Demo crew member: simulated history up to yesterday, so today's check-in is the next mission day.
export function makeDemo(scn = 'cardio', seed = 23, days = 89) {
  const log = simulate(scn, days, seed).map(e => ({ ...e, date: isoDaysAgo(days - e.d + 1) }));
  return { id: 'demo', name: 'Crew member 1', demo: true, scn, seed, mode: 'mars', blackout: false, taken: {}, log };
}
export function makeProfile(name) {
  return { id: 'c' + Date.now().toString(36), name, demo: false, mode: 'mars', blackout: false, taken: {}, log: [] };
}
export function load() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY));
    if (j && Array.isArray(j.profiles) && j.profiles.length) return j;
  } catch (e) { /* storage unavailable: fall through to a fresh demo */ }
  const p = makeDemo();
  return { current: p.id, profiles: [p] };
}
export function save(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* storage full or blocked: keep working in memory */ }
}
