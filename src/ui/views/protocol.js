// Protocol schedule: daily, weekly and periodic tasks, with the weekly and periodic logs.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { radiation, URINE_CHART, nearestSwatch } from '../../engine/index.js';
import { esc, glyph } from '../format.js';
import { timerHTML, timerState } from '../timer.js';
import { PH, photoBar, clearPhoto, prunePhotos } from '../camera.js';

export const TASKS = [
  { id: 'daily', cad: 'Daily', every: 1, name: 'Pre-flight health clearance', what: 'Blood pressure, blood oxygen, heart rate, temperature, breathing rate, sleep, fatigue, wellbeing and symptoms.', href: '#check-in' },
  { id: 'cognitive', cad: 'Weekly', every: 7, name: 'Cognitive battery', what: 'Attention, memory and fine motor tests.', href: '#cognitive' },
  { id: 'acuity', cad: 'Weekly', every: 7, name: 'Vision test, tumbling E', what: 'Spot early changes in near vision linked to spaceflight-associated neuro-ocular syndrome.' },
  { id: 'strength', cad: 'Weekly', every: 7, name: 'Muscle strength log', what: 'Grip strength for each hand with the onboard dynamometer.' },
  { id: 'balance', cad: 'Weekly', every: 7, name: 'Balance assessment', what: 'Single-leg stance, eyes open, up to 30 seconds. Do it on the treadmill harness or a foot restraint.' },
  { id: 'ecg', cad: 'Periodic', every: 30, name: 'ECG telemetry log', what: 'Record the rhythm reading from the ECG device.' },
  { id: 'hydration', cad: 'Periodic', every: 3, name: 'Urine hydration check', what: 'Urine colour against the chart (take a photo for a suggested shade), every few days or when thirsty or after heavy exercise; dark colours mean drink more.' },
  { id: 'ultrasound', cad: 'Periodic', every: 30, name: 'Ultrasound image and notes', what: 'A photo of the ultrasound screen and notes from a guided ultrasound session, such as the neck veins or eyes.' },
  { id: 'dosimeter', cad: 'Weekly', every: 7, name: 'Radiation dosimeter review', what: 'Log your personal dosimeter reading and compare it with the mission estimate.' }
];
const URINE = URINE_CHART;
const E = { on: false, line: 0, trial: 0, ok: 0, best: 0, dir: 'right' };
const SIZES = [64, 48, 36, 28, 22, 17, 13, 10, 8];
const DIRS = { right: 0, down: 90, left: 180, up: 270 };
const pick = () => Object.keys(DIRS)[Math.floor(Math.random() * 4)];
export const lastOf = (P, type) => [...(P.extra || [])].reverse().find(x => x.type === type);

function due(P, t, day) {
  if (t.id === 'daily') { const l = P.log[P.log.length - 1]; return !l || l.d < day; }
  if (t.id === 'cognitive') return !(P.cog || []).some(c => c.d > day - t.every);
  const l = lastOf(P, t.id); return !l || l.d <= day - t.every;
}
export const dueCount = (P, day) => TASKS.filter(t => due(P, t, day + 0)).length;

function form(t, P, day, m) {
  const l = lastOf(P, t.id);
  const last = l ? `<p class="small soft lastlog">${l.photo ? `<img class="thumb" src="${l.photo}" alt="Photo logged on day ${l.d}">` : ''}<span>Last logged day ${l.d}${l.summary ? `: ${esc(l.summary)}` : ''}.</span></p>` : '';
  if (t.id === 'acuity') {
    if (!E.on) return `${last}<p><button class="btn primary" data-act="e-start">Start vision test</button></p><p class="small soft">Hold the screen at the same distance each week (about 40 cm). This tracks change over time; it is not a calibrated eye chart.</p>`;
    return `<div class="tumble" aria-live="polite"><svg width="${SIZES[E.line]}" height="${SIZES[E.line]}" viewBox="0 0 5 5" style="transform:rotate(${DIRS[E.dir]}deg)" role="img" aria-label="Letter E, line ${E.line + 1}"><path d="M0 0h5v1H1v1h4v1H1v1h4v1H0z" fill="var(--ink)"/></svg></div>
      <p class="small soft" style="text-align:center">Line ${E.line + 1} of ${SIZES.length}, letter ${E.trial + 1} of 3. Which way do the bars of the E point?</p>
      <div class="dirs">${[['left', '←'], ['up', '↑'], ['down', '↓'], ['right', '→']].map(([d, a]) => `<button data-act="e-dir" data-val="${d}" aria-label="${d}">${a}</button>`).join('')}</div>`;
  }
  if (t.id === 'strength') return `${last}<div class="rowf"><label>Left hand, kg<input class="field" id="x-left" type="number" min="5" max="90" step="0.5" style="width:120px"></label><label>Right hand, kg<input class="field" id="x-right" type="number" min="5" max="90" step="0.5" style="width:120px"></label><button class="btn" data-act="x-save" data-type="strength">Log grip strength</button></div>`;
  if (t.id === 'balance') {
    const id = `bal-${day}`, s = timerState(id);
    return `${last}${timerHTML(id, { seconds: 30, title: '30-second single-leg stance', desc: 'Start, lift one foot, and press Foot down the moment you lose balance. Reaching 30 seconds is a full score.', art: 'stopwatch', runLabel: 'Holding', startSay: 'Lift one foot now.', doneSay: 'Thirty seconds. Well held.' })}
      <p style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-act="bal-down" data-t="${id}" ${s && s.running ? '' : 'disabled'}>Foot down</button><button class="btn" data-act="x-save" data-type="balance" ${s && (s.done || s.held != null) ? '' : 'disabled'}>Log ${s && s.held != null ? s.held.toFixed(1) : s && s.done ? '30.0' : ''} seconds</button></p>`;
  }
  if (t.id === 'ecg') return `${last}<div class="rowf"><label>Rhythm<select class="field" id="x-rhythm"><option>Regular</option><option>Irregular</option><option>Device could not read</option></select></label><label>Heart rate<input class="field" id="x-ecghr" type="number" min="30" max="200" style="width:110px"></label><label style="flex:1;min-width:200px">Notes<input class="field" id="x-ecgnote" maxlength="120"></label><button class="btn" data-act="x-save" data-type="ecg">Log ECG</button></div>`;
  if (t.id === 'hydration') return `${last}${photoBar('hydration')}${PH.suggest ? `<p class="note info" style="margin:10px 0">The photo looks closest to shade <b>${PH.suggest}</b> (outlined). Lighting changes colours, so compare by eye and tap the shade that matches.</p>` : '<p class="small soft" style="margin:10px 0 8px">Take a photo to get a suggested shade, or compare by eye.</p>'}<div class="rowf" role="group" aria-label="Urine colour">${URINE.map((c, k) => `<button class="btn ${PH.suggest === k + 1 ? 'suggest' : ''}" data-act="x-save" data-type="hydration" data-val="${k + 1}" style="min-width:52px;background:${c};border-color:${c};color:#222" aria-label="Colour ${k + 1}${PH.suggest === k + 1 ? ', suggested by the photo' : ''}">${k + 1}</button>`).join('')}</div><p class="small soft" style="margin-top:8px">1 to 3: well hydrated. 4 to 5: drink a little more. 6 to 8: drink now and recheck.</p>`;
  if (t.id === 'ultrasound') return `${last}${photoBar('ultrasound')}<label class="lbl" for="x-us" style="margin-top:12px">Notes</label><textarea id="x-us" style="min-height:90px" placeholder="Region scanned, guided by whom, findings in plain words"></textarea><p style="margin-top:10px"><button class="btn" data-act="x-save" data-type="ultrasound">Log ultrasound${PH.ultrasound ? ' with photo' : ' notes'}</button></p>`;
  if (t.id === 'dosimeter') { const r = radiation(day, m); return `${last}<p class="small">Mission estimate so far: <b class="num">${r.cum.toFixed(0)} mSv</b>. Career limit 600 mSv.</p><div class="rowf"><label>Personal dosimeter, mSv<input class="field" id="x-dose" type="number" min="0" max="2000" step="0.1" style="width:140px"></label><button class="btn" data-act="x-save" data-type="dosimeter">Log dosimeter reading</button></div>`; }
  return `<p><a class="btn primary" href="${t.href}">Open</a></p>`;
}

export function view(ctx) {
  const { P, day, m, S } = ctx;
  const band = `<section class="band"><div class="wrap"><div class="frame"><div class="kicker">SPACEFLIGHT MONITORING PROTOCOL</div><h1>Mission protocol</h1><p class="lede">Your daily, weekly and periodic health tasks. Due tasks glow amber; finishing the weekly set completes your weekly quest.</p></div></div></section>`;
  const groups = ['Daily', 'Weekly', 'Periodic'];
  return band + `<div class="wrap page grid">${S.msg ? `<p class="note info">${esc(S.msg)}</p>` : ''}${groups.map(g => {
    const ts = TASKS.filter(t => t.cad === g); if (!ts.length) return '';
    return `<section><h2 style="margin-bottom:12px">${g}</h2><div class="grid two">${ts.map(t => { const d = due(P, t, day); return `<article class="panel ${d ? 'br' : ''}${t.id === 'balance' ? ' wide' : ''}" id="task-${t.id}"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:6px"><h3>${t.name}</h3><span class="chip ${d ? 's2' : 's0'}">${glyph(d ? 2 : 0, 12)}${d ? 'Due' : 'Done'}</span></div><p class="soft" style="margin-bottom:12px">${t.what}</p>${t.href ? `<p><a class="btn ${d ? 'primary' : ''}" href="${t.href}">${d ? 'Start' : 'Open'}</a></p>` : form(t, P, day, m)}</article>`; }).join('')}</div></section>`;
  }).join('')}</div>`;
}

// Handles protocol actions. Returns a message for the page, or null.
export function handle(a, b, P, day) {
  const today = new Date(), date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const push = (type, data, summary) => {
    const photo = PH[type] || null;
    (P.extra = P.extra || []).push({ type, d: day, date, ...data, ...(photo ? { photo } : {}), summary: summary + (photo ? ' (photo attached)' : '') });
    if (photo) { clearPhoto(type); prunePhotos(P.extra); }
    return `${summary}${photo ? ', with photo' : ''}. Logged to day ${day}.`;
  };
  if (a === 'e-start') { Object.assign(E, { on: true, line: 0, trial: 0, ok: 0, best: 0, dir: pick() }); return null; }
  if (a === 'e-dir') {
    if (b.dataset.val === E.dir) E.ok++;
    E.trial++;
    if (E.trial === 3) {
      if (E.ok >= 2) { E.best = E.line + 1; E.line++; E.trial = 0; E.ok = 0; }
      if (E.ok < 2 && E.trial === 3 || E.line >= SIZES.length) { E.on = false; return push('acuity', { line: E.best }, `Vision test: line ${E.best} of ${SIZES.length}`); }
    }
    E.dir = pick(); return null;
  }
  if (a === 'bal-down') { const s = timerState(b.dataset.t); if (s && s.running) { s.held = s.elapsed + (performance.now() - s.startAt) / 1000; s.running = false; } return null; }
  if (a === 'x-save') {
    const t = b.dataset.type, v = id => document.getElementById(id)?.value;
    if (t === 'strength') { const l = +v('x-left'), r = +v('x-right'); if (!(l > 0 && r > 0)) return 'Enter grip strength for both hands.'; return push(t, { left: l, right: r }, `Grip ${l} kg left, ${r} kg right`); }
    if (t === 'balance') { const s = timerState(`bal-${day}`), sec = s ? (s.held != null ? s.held : s.done ? 30 : 0) : 0; if (s) { delete s.held; s.done = false; s.elapsed = 0; } return push(t, { seconds: +sec.toFixed(1) }, `Single-leg stance ${sec.toFixed(1)} s`); }
    if (t === 'ecg') { const hr = +v('x-ecghr'); return push(t, { rhythm: v('x-rhythm'), hr: hr || null, note: v('x-ecgnote') || '' }, `ECG ${String(v('x-rhythm')).toLowerCase()}${hr ? ', ' + hr + ' bpm' : ''}`); }
    if (t === 'hydration') { const c = +b.dataset.val, sug = PH.suggest; PH.suggest = null; return push(t, { colour: c, ...(sug ? { photoShade: sug } : {}) }, `Urine colour ${c} of 8${c >= 6 ? ': drink now and recheck' : c >= 4 ? ': drink a little more' : ''}`); }
    if (t === 'ultrasound') { const n = (v('x-us') || '').trim(); if (!n && !PH.ultrasound) return 'Write the ultrasound notes or add a photo first.'; return push(t, { note: n }, `Ultrasound${n ? ': ' + n.slice(0, 60) : ' image'}`); }
    if (t === 'dosimeter') { const d = +v('x-dose'); if (!(d >= 0) || v('x-dose') === '') return 'Enter the dosimeter reading in mSv.'; return push(t, { mSv: d }, `Dosimeter ${d} mSv`); }
  }
  return null;
}
export const acuityState = E;
