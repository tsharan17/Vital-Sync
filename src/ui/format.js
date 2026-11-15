// Shared formatting and small visual pieces.
import { ADAPT } from '../engine/index.js';

export const LV = ['Nominal', 'Watch', 'Tell crew medical officer', 'Contact flight surgeons'];
export const LVS = ['Nominal', 'Watch', 'Tell CMO', 'Contact ground'];
export const ST_LEVEL = [0, 2, 3]; // range status (normal, caution, alert) shown with level colours
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const fmt = (v, ind) => v == null || !isFinite(v) ? '–' : (+v).toFixed(ind.dec);
export const fd = d => d === Infinity ? 'no limit' : d < 1 ? '<1' : d >= 100 ? '99+' : String(Math.round(d));
export const dur = s => s < 60 ? s.toFixed(s < 10 ? 2 : 0) + ' s' : (s / 60).toFixed(0) + ' min';

// Status is always shape plus colour: circle, diamond, triangle, square.
export function glyph(l, z = 16) {
  const p = [
    '<circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="2.2"/>',
    '<path d="M8 1.6 14.4 8 8 14.4 1.6 8z" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    '<path d="M8 1.5 15.5 14.5H.5z" fill="currentColor"/>',
    '<rect x="1.5" y="1.5" width="13" height="13" rx="1.5" fill="currentColor"/>'
  ][l];
  return `<svg class="glyph" width="${z}" height="${z}" viewBox="0 0 16 16" aria-hidden="true">${p}</svg>`;
}
export const chip = l => `<span class="chip s${l}">${glyph(l, 12)}${LVS[l]}</span>`;
export const check = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#1aa266"/><path d="M5.5 10.4 8.6 13.3 14.6 7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function forecastText(a) {
  if (a.none) return 'No readings yet.';
  if (a.provisional) return `Your baseline is still forming. It needs 10 readings after the first ${ADAPT} days of the mission.`;
  if (a.dEarly == null) return a.st ? 'Outside your normal range now.' : 'No trend toward a limit.';
  return `Reaches the ${a.limName} limit (${fmt(a.limit, a.ind)} ${a.ind.unit}) in ${fd(a.dEarly)} to ${fd(a.dLate)} days.`;
}
export function reason(a) {
  const i = a.ind, bits = [];
  if (a.none) return '';
  if (a.st === 2) bits.push(`Latest value ${fmt(a.val, i)} ${i.unit} is in the alert range.`);
  else if (a.st === 1) bits.push(`Latest value ${fmt(a.val, i)} ${i.unit} is in the caution range.`);
  else if (a.drift) bits.push(`Latest value ${fmt(a.val, i)} ${i.unit} is still in the normal range, but it has moved ${Math.abs(a.z).toFixed(1)} standard deviations from your baseline of ${fmt(a.bm, i)}.`);
  if (a.dEarly != null) bits.push(forecastText(a) + ` Getting effective help from Earth takes about ${a.loop.toFixed(1)} days from here.`);
  return bits.join(' ');
}
export const stepsFor = a => a.level === 3 ? a.ind.now : a.level === 2 ? a.ind.cmo : a.ind.self;
export const rank = A => [...A].sort((x, y) => y.level - x.level || (x.margin ?? 1e9) - (y.margin ?? 1e9) || Math.abs(y.z || 0) - Math.abs(x.z || 0));
