// Trend chart with personal baseline, limits, forecast cone and the Earth response line.
import { fmt, esc } from './format.js';

const COL = ['var(--s0-fill)', 'var(--s1-fill)', 'var(--s2-fill)', 'var(--s3-fill)'];

export function chart(a, day, o = {}) {
  const W = o.W || 760, H = o.H || 280, i = a.ind;
  const x0 = Math.max(1, day - (o.span || 59));
  const hz = Math.min(45, Math.max(14, a.dLate && isFinite(a.dLate) ? Math.ceil(a.dLate) + 4 : 21));
  const x1 = day + hz, pts = a.pts.filter(p => p.d >= x0 && p.d <= day), L = 48, Rr = 14, T = 14, B = 30;
  let lo = Math.min(...pts.map(p => p.v), a.bm), hi = Math.max(...pts.map(p => p.v), a.bm);
  if (a.limit != null) { lo = Math.min(lo, a.limit); hi = Math.max(hi, a.limit); }
  const pad = (hi - lo || 1) * 0.16; lo -= pad; hi += pad;
  const X = d => L + (d - x0) / (x1 - x0) * (W - L - Rr), Y = v => T + (hi - v) / (hi - lo) * (H - T - B), cl = v => Math.min(hi, Math.max(lo, v));
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(i.name)}: readings, baseline and forecast">`;
  s += `<rect x="${L}" y="${Y(cl(i.g[1]))}" width="${W - L - Rr}" height="${Math.max(0, Y(cl(i.g[0])) - Y(cl(i.g[1])))}" fill="var(--s0-fill)" opacity=".09"/>`;
  for (let k = 0; k <= 4; k++) { const v = lo + (hi - lo) * k / 4; s += `<line x1="${L}" x2="${W - Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width=".8"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${v.toFixed(i.dec)}</text>`; }
  for (const [v, c, n] of [[i.g[0], 'var(--s2-fill)', 'caution'], [i.g[1], 'var(--s2-fill)', 'caution'], [i.a[0], 'var(--s3-fill)', 'alert'], [i.a[1], 'var(--s3-fill)', 'alert']])
    if (v > lo && v < hi) s += `<line x1="${L}" x2="${W - Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="${c}" stroke-width="2" stroke-dasharray="8 5"/><text x="${W - Rr - 4}" y="${Y(v) - 5}" text-anchor="end">${n} limit ${v}</text>`;
  s += `<line x1="${L}" x2="${W - Rr}" y1="${Y(a.bm)}" y2="${Y(a.bm)}" stroke="var(--cobalt)" stroke-width="1.5" stroke-dasharray="2 4"/>`;
  const lx = day + a.loop;
  if (lx < x1) s += `<line x1="${X(lx)}" x2="${X(lx)}" y1="${T}" y2="${H - B}" stroke="var(--deep)" stroke-width="1.5" stroke-dasharray="3 4"/><text x="${X(lx) + 5}" y="${H - B - 8}" style="fill:var(--deep)">Earth help takes effect</text>`;
  if (a.fit && a.dEarly != null) {
    const f = a.fit, c = COL[Math.max(1, a.level)], sg = Math.sign(f.b), e = 1.96 * f.se, yv = (d, sl) => cl(a.cur + sl * (d - day));
    s += `<polygon points="${X(day)},${Y(a.cur)} ${X(x1)},${Y(yv(x1, f.b + sg * e))} ${X(x1)},${Y(yv(x1, f.b - sg * e))}" fill="${c}" opacity=".18"/>`;
    s += `<line x1="${X(Math.max(x0, f.from))}" y1="${Y(cl(f.a + f.b * Math.max(x0, f.from)))}" x2="${X(x1)}" y2="${Y(yv(x1, f.b))}" stroke="${c}" stroke-width="2.5"/>`;
    const ex = day + a.dEarly; if (ex < x1) s += `<circle cx="${X(ex)}" cy="${Y(a.limit)}" r="6" fill="var(--white)" stroke="${c}" stroke-width="2.5"/>`;
  }
  s += `<polyline points="${pts.map(p => X(p.d).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' ')}" fill="none" stroke="var(--blue)" stroke-width="1" opacity=".35"/>`;
  for (const p of pts) s += `<circle cx="${X(p.d)}" cy="${Y(p.v)}" r="2.6" fill="var(--blue)" opacity=".8"/>`;
  const last = pts[pts.length - 1];
  if (last) s += `<line x1="${X(last.d)}" x2="${X(last.d)}" y1="${T}" y2="${H - B}" stroke="var(--soft)" stroke-width=".8"/><circle cx="${X(last.d)}" cy="${Y(last.v)}" r="11" fill="var(--s3-fill)" opacity=".18"/><circle cx="${X(last.d)}" cy="${Y(last.v)}" r="6" fill="var(--ink)" stroke="var(--white)" stroke-width="2"/><text x="${X(last.d)}" y="${H - 9}" text-anchor="middle" style="fill:var(--ink);font-weight:700">${o.todayLabel || 'day ' + last.d}</text>`;
  s += `<text x="${L}" y="${H - 9}">day ${x0}</text><text x="${W - Rr}" y="${H - 9}" text-anchor="end">day ${x1}</text></svg>`;
  if (o.legend === false) return s;
  return s + `<div class="legend"><span style="color:var(--cobalt)"><i style="border-top-style:dotted"></i>your baseline ${fmt(a.bm, i)}</span><span style="color:var(--s2-fill)"><i style="border-top-style:dashed"></i>caution limit</span><span style="color:var(--s3-fill)"><i style="border-top-style:dashed"></i>alert limit</span>${a.dEarly != null ? '<span style="color:var(--s2-fill)"><i></i>trend, shaded cone is the uncertainty; the ring marks the earliest limit crossing</span>' : ''}<span style="color:var(--deep)"><i style="border-top-style:dotted"></i>when help from Earth takes effect</span></div>`;
}

export function spark(a, day) {
  const p = a.pts.filter(x => x.d <= day).slice(-30); if (p.length < 2) return '';
  const lo = Math.min(...p.map(x => x.v), a.ind.g[0], a.bm), hi = Math.max(...p.map(x => x.v), a.ind.g[1], a.bm), W = 260, H = 48;
  const X = k => 3 + k / (p.length - 1) * (W - 10), Y = v => 5 + (hi - v) / (hi - lo || 1) * (H - 10);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="${Y(a.ind.g[1])}" width="${W}" height="${Math.max(0, Y(a.ind.g[0]) - Y(a.ind.g[1]))}" fill="var(--s0-fill)" opacity=".1"/><polyline points="${p.map((x, k) => X(k).toFixed(1) + ',' + Y(x.v).toFixed(1)).join(' ')}" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><circle cx="${X(p.length - 1)}" cy="${Y(p[p.length - 1].v)}" r="4" fill="var(--ink)"/></svg>`;
}
