// Vital Sync engine. Pure functions, no DOM.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
// Seeded mission simulator and detection test. Output is always marked simulated.
import { ADAPT, BASE_N, MODES, IND, byId } from './indicators.js';
import { analyze } from './analysis.js';

export function rng(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
export const SCN = {
  cardio: {name:'Silent blood pressure climb', onset:60, targets:['sys'], also:['dia','hr'], text:'From day 60 systolic pressure rises 0.22 mmHg a day. No single reading looks abnormal for weeks.'},
  sleep: {name:'Sleep and mood slide', onset:70, targets:['sleep','mood'], also:['fatigue'], text:'From day 70 sleep shortens by 2 minutes a night and mood follows.'},
  infection: {name:'Brewing infection', onset:100, targets:['temp','hr'], also:['sleep','rr','spo2','fatigue','mood'], text:'From day 100 temperature and resting heart rate rise over one week.'},
  healthy: {name:'Healthy mission', onset:9999, targets:[], text:'No planted problem. Used to count false alarms.'}
};
export function simulate(scn, days, seed) {
  const rnd = rng(seed), g = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return (u - 3) / 0.7071; };
  const base = {hr:58, sys:112, dia:70, glu:88, temp:36.6, sleep:7.9, mood:7.8, spo2:97.6, rr:14, fatigue:2.4}, sd = {hr:2.2, sys:3, dia:2, glu:4, temp:0.12, sleep:0.45, mood:0.7, spo2:0.7, rr:1.1, fatigue:0.55};
  const log = [], o = SCN[scn].onset, wb = () => Math.max(1, Math.min(5, Math.round(2 + 0.8 * g())));
  for (let d = 1; d <= days; d++) {
    const ad = Math.exp(-d / 5), k = Math.max(0, d - o), v = {};
    v.hr = base.hr + 6 * ad + sd.hr * g(); v.sys = base.sys + 4 * ad + sd.sys * g(); v.dia = base.dia + sd.dia * g();
    v.glu = base.glu + sd.glu * g(); v.temp = base.temp + sd.temp * g();
    v.sleep = base.sleep - 1.2 * ad + sd.sleep * g(); v.mood = base.mood - 0.9 * ad + sd.mood * g();
    v.spo2 = base.spo2 + sd.spo2 * g(); v.rr = base.rr + 1.5 * ad + sd.rr * g(); v.fatigue = base.fatigue + 1.2 * ad + sd.fatigue * g();
    if (scn === 'cardio') { v.sys += 0.22 * k; v.dia += 0.07 * k; v.hr += 0.05 * k; }
    if (scn === 'sleep') { v.sleep -= 0.033 * k; v.mood -= 0.035 * k; v.fatigue += 0.03 * k; }
    if (scn === 'infection') { v.temp += Math.min(1.7, 0.1 * k); v.hr += Math.min(20, 1.3 * k); v.sleep -= Math.min(1, 0.1 * k); v.rr += Math.min(6, 0.7 * k); v.spo2 -= Math.min(2.5, 0.25 * k); v.fatigue += Math.min(2.5, 0.3 * k); }
    for (const i of IND) v[i.id] = Math.min(i.max, Math.max(i.min, +v[i.id].toFixed(i.dec)));
    log.push({d, v, ex: Math.max(0, Math.round(108 + 18 * g())), q: {stress: wb(), isolation: wb()}, sx: [], sim: true});
  }
  return log;
}
export function evaluate(log, scn) {
  const S = SCN[scn], N = log.length ? log[log.length - 1].d : 0, start = ADAPT + BASE_N + 1, rows = [];
  let fa = 0, tot = 0;
  for (const m of MODES) {
    for (const id of (S.targets.length ? S.targets : [])) {
      const ind = byId(id); let w = null, act = null, amb = null;
      for (let d = Math.max(start, S.onset); d <= N; d++) {
        const a = analyze(log, ind, d, m, false);
        if (w == null && a.drift >= 1) w = d; if (act == null && a.drift === 2) act = d; if (amb == null && a.st >= 1) amb = d;
      }
      rows.push({mode: m, ind, watch: w, act, amber: amb});
    }
  }
  const m0 = MODES[0];
  for (const ind of IND) for (let d = start; d <= N; d++) {
    if (d >= S.onset && (S.targets.includes(ind.id) || (S.also || []).includes(ind.id))) continue;
    tot++; if (analyze(log, ind, d, m0, false).drift >= 1) fa++;
  }
  return {rows, fa, tot, N, onset: S.onset};
}
