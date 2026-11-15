// Theme: 'light' (NASA white and blue), 'satellite' (dark telemetry) or 'auto' (follows the device setting).
const KEY = 'vital-sync-theme', mq = matchMedia('(prefers-color-scheme: dark)');
export const THEMES = [['light', '☀️ Light'], ['satellite', '🛰️ Satellite'], ['auto', '◐ Auto']];
export function themePref() { try { const v = localStorage.getItem(KEY); return THEMES.some(t => t[0] === v) ? v : 'auto'; } catch { return 'auto'; } }
export const resolve = p => p === 'auto' ? (mq.matches ? 'satellite' : 'light') : p;
export function applyTheme(p = themePref()) {
  const r = resolve(p), h = document.documentElement;
  h.dataset.theme = r;
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = r === 'light' ? '#061d4a' : '#070b14';
  return r;
}
export function setTheme(p) { try { localStorage.setItem(KEY, p); } catch { /* storage unavailable */ } return applyTheme(p); }
mq.addEventListener?.('change', () => { if (themePref() === 'auto') applyTheme('auto'); });
