// Animated HUD timer for clinical procedures: circular progress, countdown, pulsing core, audio cues and tap counting.
// Timer state lives here, so timers keep running when the page re-renders.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { sfx } from './soundFx.js';
import { voice } from './audioGuide.js';

const T = {}; let raf = 0, onDone = () => {};
export const onTimerDone = fn => { onDone = fn; };
const R = 74, C = 2 * Math.PI * R;
const mmss = s => { s = Math.max(0, Math.ceil(s)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const ART = {
  heart: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 56S6 40 6 22a12 12 0 0 1 26-6 12 12 0 0 1 26 6c0 18-26 34-26 34z" fill="var(--s3-bg)" stroke="var(--s3-fill)" stroke-width="2"/><path d="M14 30h10l4-8 6 16 4-8h12" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lungs: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 8v20M32 28c-4 2-6 6-7 10M32 28c4 2 6 6 7 10" stroke="var(--blue)" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M26 18c-8 2-16 14-16 28 0 6 4 9 9 8 6-1 8-6 8-12V22c0-3-1-4-1-4zM38 18c8 2 16 14 16 28 0 6-4 9-9 8-6-1-8-6-8-12V22c0-3 1-4 1-4z" fill="var(--tick)" stroke="var(--blue)" stroke-width="2"/></svg>',
  drop: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6C24 20 16 30 16 40a16 16 0 0 0 32 0c0-10-8-20-16-34z" fill="var(--s3-bg)" stroke="var(--s3-fill)" stroke-width="2"/></svg>',
  thermo: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="27" y="6" width="10" height="38" rx="5" fill="none" stroke="var(--s2-fill)" stroke-width="2.5"/><circle cx="32" cy="48" r="9" fill="var(--s2-bg)" stroke="var(--s2-fill)" stroke-width="2.5"/><path d="M32 18v30" stroke="var(--s2-fill)" stroke-width="4"/></svg>',
  pulseox: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="18" width="48" height="28" rx="10" fill="none" stroke="var(--s0-fill)" stroke-width="2.5"/><path d="M14 32h8l3-6 5 12 4-8 3 2h13" fill="none" stroke="var(--s0-fill)" stroke-width="2.5" stroke-linejoin="round"/></svg>',
  stopwatch: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="20" fill="none" stroke="var(--blue)" stroke-width="2.5"/><path d="M32 36V24M26 8h12M32 8v8" stroke="var(--blue)" stroke-width="2.5" stroke-linecap="round"/></svg>'
};

function st(id, cfg) {
  if (!T[id]) T[id] = { id, cfg, elapsed: 0, running: false, startAt: 0, taps: 0, done: false, lastSec: null, fired: {} };
  else T[id].cfg = cfg;
  return T[id];
}
export const timerState = id => T[id];
const remain = s => Math.max(0, s.cfg.seconds - s.elapsed - (s.running ? (performance.now() - s.startAt) / 1000 : 0));

export function timerHTML(id, cfg) {
  const s = st(id, cfg), r = remain(s), frac = 1 - r / cfg.seconds;
  const ticks = Array.from({ length: 60 }, (_, k) => { const a = k / 60 * 2 * Math.PI, r1 = 82, r2 = k % 5 ? 79 : 76; return `<line x1="${86 + r1 * Math.sin(a)}" y1="${86 - r1 * Math.cos(a)}" x2="${86 + r2 * Math.sin(a)}" y2="${86 - r2 * Math.cos(a)}" stroke="var(--tick)" stroke-width="${k % 5 ? 1 : 2}"/>`; }).join('');
  const label = s.done ? 'Complete' : s.running ? (cfg.runLabel || 'Running') : s.elapsed ? 'Paused' : 'Ready';
  const tapBtn = cfg.tap ? `<button class="btn go tap" data-act="t-tap" data-t="${id}" ${s.running ? '' : 'disabled'}>Tap each ${cfg.tap === 'beats' ? 'beat' : 'breath'}</button><span class="count" id="tc-${id}">${s.taps} ${cfg.tap}</span>` : '';
  return `<div class="tmr ${s.running ? 'running' : ''} ${s.done ? 'done' : ''}" id="tm-${id}" style="--beat:${(60 / (cfg.bpm || 65)).toFixed(2)}s">
    <div class="dial">
      <svg viewBox="0 0 172 172" aria-hidden="true">${ticks}<circle cx="86" cy="86" r="${R}" fill="none" stroke="var(--track)" stroke-width="8"/><circle id="tr-${id}" cx="86" cy="86" r="${R}" fill="none" stroke="${s.done ? 'var(--s0-fill)' : 'var(--blue)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}" transform="rotate(-90 86 86)" style="filter:drop-shadow(0 0 6px currentColor)"/></svg>
      <div class="art ${cfg.anim || ''}">${ART[cfg.art || 'stopwatch']}</div>
      <div class="core"><div class="digits" id="td-${id}" role="timer" aria-live="off">${mmss(r)}</div><div class="sub" id="ts-${id}">${label}</div></div>
    </div>
    <div><h3>${cfg.title}</h3><p class="soft small">${cfg.desc}</p>
      <div class="tctl"><button class="btn primary" data-act="t-start" data-t="${id}">${s.done ? 'Run again' : s.running ? 'Pause' : s.elapsed ? 'Resume' : 'Start timer'}</button>${s.elapsed || s.running || s.done ? `<button class="btn" data-act="t-reset" data-t="${id}">Reset</button>` : ''}${tapBtn}</div>
    </div></div>`;
}

function loop() {
  raf = 0; let any = false;
  for (const id in T) {
    const s = T[id]; if (!s.running) continue; any = true;
    const r = remain(s), sec = Math.ceil(r), el = document.getElementById('td-' + id), ring = document.getElementById('tr-' + id);
    if (el) el.textContent = mmss(r);
    if (ring) ring.setAttribute('stroke-dashoffset', (C * (r / s.cfg.seconds)).toFixed(1));
    if (sec !== s.lastSec) {
      s.lastSec = sec;
      if (s.cfg.tick && sec > 0) sfx.tick();
      for (const c of s.cfg.chimeAt || []) if (sec === c && !s.fired[c]) { s.fired[c] = 1; sfx.chime(); voice.say(`${c} seconds remaining.`); }
    }
    if (r <= 0) {
      s.running = false; s.done = true; s.elapsed = s.cfg.seconds; sfx.bell(); sfx.calmStop();
      if (s.cfg.doneSay) voice.say(s.cfg.doneSay);
      onDone(id, s);
    }
  }
  if (any) raf = requestAnimationFrame(loop);
}
export function mountTimers() { if (!raf && Object.values(T).some(s => s.running)) raf = requestAnimationFrame(loop); }

// Returns true when the page should re-render.
export function timerAction(act, id) {
  const s = T[id]; if (!s) return false;
  if (act === 't-start') {
    if (s.done) { s.done = false; s.elapsed = 0; s.taps = 0; s.fired = {}; }
    if (s.running) { s.elapsed += (performance.now() - s.startAt) / 1000; s.running = false; sfx.calmStop(); }
    else { s.running = true; s.startAt = performance.now(); sfx.confirm(); if (s.cfg.calm) sfx.calmStart(); if (s.cfg.startSay) voice.say(s.cfg.startSay); mountTimers(); }
    return true;
  }
  if (act === 't-reset') { Object.assign(s, { elapsed: 0, running: false, done: false, taps: 0, fired: {}, lastSec: null }); sfx.calmStop(); return true; }
  if (act === 't-tap') {
    if (!s.running) return false;
    s.taps++; s.cfg.tap === 'beats' ? sfx.beat() : sfx.blip();
    const c = document.getElementById('tc-' + id); if (c) c.textContent = `${s.taps} ${s.cfg.tap}`;
    const tm = document.getElementById('tm-' + id); if (tm) { const a = tm.querySelector('.art svg'); if (a && a.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) a.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 260 }); }
    return false;
  }
  return false;
}
export function resetTimers(prefix = '') { for (const id in T) if (id.startsWith(prefix)) { T[id].running = false; delete T[id]; } sfx.calmStop(); }
