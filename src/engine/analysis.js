// Vital Sync engine. Pure functions, no DOM.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
// Personal baseline, drift detection, forecast to limit and lead-time margin.
import { ADAPT, BASE_N, T_SIG, IND } from './indicators.js';

export const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
export const sdev = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1)); };
export const statusOf = (ind, v) => (v >= ind.g[0] && v <= ind.g[1]) ? 0 : (v >= ind.a[0] && v <= ind.a[1]) ? 1 : 2;
export const consultDays = m => 3 * (2 * m.oneWayS / 86400 + m.reviewH / 24);
export const respLoop = (m, ind, blackout) => consultDays(m) + ind.onset + (blackout ? m.black : 0);

export function regress(pts) {
  const n = pts.length; if (n < 6) return null;
  const mx = mean(pts.map(p => p.d)), my = mean(pts.map(p => p.v));
  let sxx = 0, sxy = 0; for (const p of pts) { sxx += (p.d - mx) ** 2; sxy += (p.d - mx) * (p.v - my); }
  if (!sxx) return null;
  const b = sxy / sxx, a = my - b * mx;
  let sse = 0; for (const p of pts) sse += (p.v - a - b * p.d) ** 2;
  const se = Math.max(Math.sqrt(sse / (n - 2) / sxx), 1e-6);
  return {b, a, se, t: b / se, n, from: pts[0].d};
}

export function analyze(log, ind, day, mode, blackout) {
  const pts = []; for (const e of log) if (e.d <= day && e.v[ind.id] != null) pts.push({d: e.d, v: e.v[ind.id]});
  const loop = respLoop(mode, ind, blackout);
  if (!pts.length) return {ind, none: true, st: 0, drift: 0, level: 0, loop, pts};
  const last = pts[pts.length - 1];
  const tail = n => pts.filter(p => p.d > day - n).map(p => p.v);
  const val = ind.avg ? mean(tail(ind.avg).length ? tail(ind.avg) : [last.v]) : last.v;
  const st = statusOf(ind, val);
  let bw = pts.filter(p => p.d > ADAPT && p.d <= ADAPT + BASE_N), provisional = false;
  if (bw.length < 10) { if (bw.length < 5) bw = pts.slice(0, Math.min(pts.length, BASE_N)); provisional = true; }
  const bm = mean(bw.map(p => p.v)), bsd = Math.max(sdev(bw.map(p => p.v)), ind.sdMin);
  const r7 = tail(7).length ? mean(tail(7)) : last.v;
  const z = (r7 - bm) / bsd;
  const hi = ind.bad !== 'low', lo = ind.bad !== 'high';
  const zbad = ((z > 0 && hi) || (z < 0 && lo)) ? Math.abs(z) : 0;
  let fit = null;
  for (const w of [10, 28]) { const f = regress(pts.filter(p => p.d > day - w)); if (f && (!fit || Math.abs(f.t) > Math.abs(fit.t))) fit = f; }
  const sig = !!fit && Math.abs(fit.t) >= T_SIG;
  const dirBad = !!fit && ((fit.b > 0 && hi) || (fit.b < 0 && lo));
  const cur = fit ? fit.a + fit.b * day : r7;
  let limit = null, limName = null, dEarly = null, dMid = null, dLate = null;
  if (sig && dirBad && !provisional) {
    if (fit.b > 0) { if (cur < ind.g[1]) { limit = ind.g[1]; limName = 'caution'; } else if (cur < ind.a[1]) { limit = ind.a[1]; limName = 'alert'; } }
    else { if (cur > ind.g[0]) { limit = ind.g[0]; limName = 'caution'; } else if (cur > ind.a[0]) { limit = ind.a[0]; limName = 'alert'; } }
    if (limit != null) {
      const gap = Math.abs(limit - cur), ab = Math.abs(fit.b), slow = ab - 1.96 * fit.se;
      dEarly = gap / (ab + 1.96 * fit.se); dMid = gap / ab; dLate = slow > 0 ? gap / slow : Infinity;
    }
  }
  let drift = 0;
  if (!provisional && ((sig && dirBad && zbad >= 1) || zbad >= 2.2)) drift = 1;
  if (drift && ((dEarly != null && dEarly <= mode.k * loop) || zbad >= 3.5)) drift = 2;
  const margin = dEarly != null ? dEarly - loop : null;
  const level = st === 2 ? 3 : (st === 1 || drift === 2) ? 2 : drift === 1 ? 1 : 0;
  const onboard = level >= 2 && margin != null && margin < 0;
  return {ind, pts, last, val, st, bm, bsd, provisional, r7, z, zbad, fit, sig, dirBad, cur, limit, limName, dEarly, dMid, dLate, loop, margin, drift, level, onboard};
}
export const analyzeAll = (log, day, mode, blackout) => IND.map(i => analyze(log, i, day, mode, blackout));

