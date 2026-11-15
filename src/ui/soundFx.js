// Procedural sci-fi sound effects with the Web Audio API. No audio files.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
const KEY = 'vital-sync-mute';
let ctx = null, master = null, muted = (() => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } })();
let calm = null;

function ac() {
  if (muted) return null;
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { ctx = new C(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); } catch (e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
function tone(freq, dur, { type = 'sine', gain = 0.12, at = 0, to = null, attack = 0.005 } = {}) {
  const c = ac(); if (!c) return;
  const t0 = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
}
export const sfx = {
  blip: () => tone(1320, 0.07, { type: 'triangle', gain: 0.06, to: 1760 }),
  select: () => { tone(880, 0.06, { type: 'square', gain: 0.03 }); tone(1320, 0.08, { type: 'triangle', gain: 0.05, at: 0.05 }); },
  confirm: () => { tone(660, 0.1, { type: 'triangle', gain: 0.08 }); tone(990, 0.16, { type: 'triangle', gain: 0.08, at: 0.09 }); },
  tick: () => tone(2200, 0.025, { type: 'square', gain: 0.02 }),
  beat: () => { tone(70, 0.12, { gain: 0.25, to: 45 }); tone(60, 0.1, { gain: 0.18, at: 0.16, to: 40 }); },
  chime: () => { tone(1046, 0.5, { gain: 0.09 }); tone(1568, 0.6, { gain: 0.05, at: 0.02 }); },
  bell: () => { [523, 659, 784, 1046].forEach((f, k) => tone(f, 0.9, { gain: 0.08, at: k * 0.08 })); },
  fanfare: () => { [523, 659, 784, 1046, 1318].forEach((f, k) => tone(f, 0.28, { type: 'triangle', gain: 0.09, at: k * 0.11 })); tone(1568, 0.8, { type: 'triangle', gain: 0.08, at: 0.6 }); },
  error: () => { tone(220, 0.18, { type: 'sawtooth', gain: 0.05 }); tone(165, 0.22, { type: 'sawtooth', gain: 0.05, at: 0.16 }); },
  klaxon: (level = 2) => { const n = level >= 3 ? 3 : 1; for (let k = 0; k < n; k++) { tone(740, 0.22, { type: 'sawtooth', gain: 0.05, at: k * 0.5 }); tone(554, 0.22, { type: 'sawtooth', gain: 0.05, at: k * 0.5 + 0.24 }); } },
  // Calm ambient pad for the 5-minute blood pressure rest.
  calmStart() {
    const c = ac(); if (!c || calm) return;
    const g = c.createGain(); g.gain.value = 0.0001; g.connect(master); g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 2);
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.125; lg.gain.value = 0.025; lfo.connect(lg); lg.connect(g.gain); lfo.start();
    const os = [110, 164.8, 220.5].map(f => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(g); o.start(); return o; });
    calm = { g, os, lfo };
  },
  calmStop() {
    if (!calm || !ctx) { calm = null; return; }
    const { g, os, lfo } = calm; calm = null;
    try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(g.gain.value || 0.03, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1); } catch (e) {}
    setTimeout(() => { os.forEach(o => { try { o.stop(); } catch (e) {} }); try { lfo.stop(); } catch (e) {} }, 1100);
  }
};
export const isMuted = () => muted;
export function setMuted(b) {
  muted = !!b; try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) {}
  if (muted) sfx.calmStop();
}
