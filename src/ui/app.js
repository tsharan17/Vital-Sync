// Vital Sync app shell: state, routing, HUD, sound and voice, and event handling.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { IND, MODES, byId, analyzeAll, simulate, evaluate, cognitiveScore, xpOf, rankOf, achievements } from '../engine/index.js';
import { load, save, makeDemo, makeProfile, todayISO } from '../store.js';
import { esc } from './format.js';
import { regionLevels } from './assess.js';
import { Holo, onPick } from './holo.js';
import { sfx, isMuted, setMuted } from './soundFx.js';
import { voice, parseSpoken } from './audioGuide.js';
import { timerAction, mountTimers, onTimerDone, resetTimers, timerState } from './timer.js';
import { starfield } from './starfield.js';
import * as checkin from './views/checkin.js';
import * as today from './views/today.js';
import * as body from './views/body.js';
import * as trends from './views/trends.js';
import * as systems from './views/systems.js';
import * as comms from './views/comms.js';
import * as about from './views/about.js';
import * as validation from './views/validation.js';
import * as cognitive from './views/cognitive.js';
import * as protocol from './views/protocol.js';
import * as profile from './views/profile.js';

const I = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const NAV = [
  ['check-in', 'Clearance', I('<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/>')],
  ['today', 'Today', I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')],
  ['body', 'Body scan', I('<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 10h8M10 21l2-6 2 6"/><ellipse cx="12" cy="13" rx="9" ry="3"/>')],
  ['trends', 'Trends', I('<path d="M3 17l5-5 4 3 8-9"/><path d="M15 6h5v5"/>')],
  ['cognitive', 'Cognitive', I('<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>')],
  ['protocol', 'Protocol', I('<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4M16 2v4M4 9h16M8 13h3M8 17h6"/>')],
  ['systems', 'Systems', I('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>')],
  ['ground-link', 'Ground link', I('<path d="M4 20l5-9 4 4z"/><path d="M12 8a4 4 0 0 1 4 4M12 4a8 8 0 0 1 8 8"/>')],
  ['profile', 'Crew', I('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>')],
  ['about', 'About', I('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>')]
];
const VIEWS = { 'check-in': checkin, today, body, trends, systems, 'ground-link': comms, about, validation, cognitive, protocol, profile };
const NEEDS_DATA = ['today', 'body', 'trends', 'systems', 'ground-link'];
const MARK = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" fill="none" stroke="#00e5ff" stroke-width="1.5"/><ellipse cx="22" cy="22" rx="21" ry="8" fill="none" stroke="#00e5ff" stroke-width="1.2" transform="rotate(-24 22 22)" opacity=".7"/><path d="M8 23h7l3-6 5 12 4-9 2 3h7" fill="none" stroke="#00ff9d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="36" cy="13" r="2.6" fill="#ff2a5f"/></svg>';
const SND = [I('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>'), I('<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>')];
const MIC = I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>');

const db = load();
const S = { ci: null, justSaved: false, sel: null, viewDay: null, ev: null, msg: '', lastRoute: null, focus: null, newBadges: [] };
const prof = () => db.profiles.find(p => p.id === db.current) || db.profiles[0];
const lastDay = () => { const L = prof().log; return L.length ? L[L.length - 1].d : 0; };
const modeOf = p => MODES.find(x => x.id === p.mode) || MODES[3];
const defaultRoute = () => { const L = prof().log, last = L[L.length - 1]; return last && last.date === todayISO() ? 'today' : 'check-in'; };
const route = () => { const h = location.hash.slice(1); return VIEWS[h] ? h : defaultRoute(); };
const persist = () => save(db);

function ctx(forDay) {
  const P = prof(), m = modeOf(P), ld = lastDay(), day = forDay ?? Math.min(S.viewDay ?? ld, ld);
  return { P, db, m, S, day, lastDay: ld, A: analyzeAll(P.log, day, m, P.blackout, P.baseline) };
}

function hud(v, P, m) {
  const x = xpOf(P), r = rankOf(x.total), due = protocol.dueCount(P, lastDay());
  const rail = `<aside class="rail"><a class="brand" href="#check-in" aria-label="Vital Sync home">${MARK}</a><nav aria-label="Main" style="display:contents">${NAV.map(([id, t, ic]) => `<a class="nv" href="#${id}" ${id === v ? 'aria-current="page"' : ''}>${ic}${t}${id === 'protocol' && due > 1 ? '<span class="dot" aria-label="Tasks due"></span>' : ''}</a>`).join('')}</nav></aside>`;
  const bar = `<header class="hud"><div class="wrap">
    <div class="clock"><b id="clk">MET D${String(lastDay()).padStart(3, '0')} · --:--:--</b><span>Vital Sync</span></div>
    <label for="crew" class="sr">Crew member</label><select id="crew">${db.profiles.map(p => `<option value="${p.id}" ${p.id === P.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}<option value="__add">Add crew member…</option></select>
    <label for="mode" class="sr">Location</label><select id="mode">${MODES.map(o => `<option value="${o.id}" ${o.id === m.id ? 'selected' : ''}>${o.name}</option>`).join('')}</select>
    ${m.black ? `<label class="chk" style="font-size:13px;color:var(--ink)"><input type="checkbox" id="black" ${P.blackout ? 'checked' : ''}>${m.black}-day blackout</label>` : ''}
    <a class="rankchip" href="#profile"><b>${r.name}</b><span class="xpbar"><i style="width:${(r.progress * 100).toFixed(1)}%"></i></span><span class="soft">${x.total.toLocaleString()} XP</span></a>
    <button class="tog" data-act="snd" aria-pressed="${!isMuted()}" aria-label="Sound effects">${SND[isMuted() ? 1 : 0]}${isMuted() ? 'Muted' : 'Sound'}</button>
    ${voice.canSpeak ? `<button class="tog" data-act="vc" aria-pressed="${voice.on}" aria-label="Voice coach">${MIC}Voice</button>` : ''}
    ${P.demo ? '<a class="demo" href="#validation">Demo</a>' : ''}
  </div></header>`;
  return { rail, bar };
}

function render() {
  const v = route(), c = ctx(), P = c.P;
  if (v !== 'cognitive') cognitive.stop();
  if (v === 'check-in' && !S.ci) { S.ci = checkin.initDraft(P, ctx(lastDay()).A); resetTimers('ci-'); }
  if (v === 'check-in') Object.assign(c, { A: ctx(lastDay()).A, day: lastDay() });
  if (!S.sel) S.sel = (c.A.slice().sort((x, y) => y.level - x.level)[0] || {}).ind?.id;
  let main;
  if (!P.log.length && NEEDS_DATA.includes(v)) main = `<section class="band"><div class="wrap"><div class="frame"><div class="kicker">NO TELEMETRY</div><h1>No readings yet.</h1><p class="lede">${esc(P.name)} has not completed a clearance. The first one takes about ten minutes with the timed rests.</p><p style="margin-top:24px"><a class="btn primary big" href="#check-in">Start your first clearance</a></p></div></div></section>`;
  else main = VIEWS[v].view(c);
  const replay = S.viewDay != null && S.viewDay < lastDay() && v !== 'check-in' ? `<div class="wrap" style="margin-top:14px"><p class="note info">Viewing mission day ${S.viewDay}. <button class="btn ghost" data-act="replay-clear">Back to the latest day</button></p></div>` : '';
  const { rail, bar } = hud(v, P, c.m);
  document.getElementById('app').innerHTML = `<a class="sr" href="#main">Skip to content</a><div class="shell">${rail}<div class="main">${bar}<main id="main" tabindex="-1">${replay}${main}</main>
  <footer class="foot"><div class="wrap"><span>Vital Sync by Team V-Sync. Decision support, not diagnosis. Built for the NASA Space Apps Challenge 2026; not affiliated with or endorsed by NASA.</span><span><a href="#validation">Demo and validation</a> · Data stays on this device</span></div></footer></div></div>`;
  if (v !== S.lastRoute) { window.scrollTo(0, 0); S.lastRoute = v; }
  S.justSaved = false; S.msg = ''; S.newBadges = [];
  tickClock();
  const h = document.getElementById('holo');
  if (h) {
    const a = c.A.find(x => x.ind.id === S.sel) || c.A[0], L = regionLevels(c.A, P, c.day, c.m);
    let ok = false; try { ok = Holo.mount(h, L, a.ind.region, S.focus); } catch (e) { ok = false; }
    if (!ok) h.innerHTML = body.figure(L);
  }
  mountTimers();
  if (v === 'cognitive') cognitive.mount(render);
}

function tickClock() {
  const el = document.getElementById('clk'); if (!el) return;
  const d = new Date(), p = n => String(n).padStart(2, '0');
  el.textContent = `MET D${String(lastDay()).padStart(3, '0')} · ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}

function selectRegion(k) {
  sfx.select();
  if (k === 'halo') { location.hash = 'systems'; return; }
  S.focus = k;
  const A = ctx().A.filter(a => a.ind.region === k && !a.none).sort((x, y) => y.level - x.level);
  if (A.length) S.sel = A[0].ind.id;
  voice.say(`${body.REG[k] ? body.REG[k].name : k} diagnostics.`);
  render();
}
onPick(selectRegion);

function setCi(id, raw) {
  const ind = checkin.indOf(id), x = +raw;
  if (!isFinite(x)) return;
  S.ci.v[id] = +Math.min(ind.max, Math.max(ind.min, x)).toFixed(ind.dec);
  checkin.live(id, S.ci, ctx(lastDay()).A);
}
function goStep(i) {
  const D = S.ci; D.seen[D.steps[D.i]] = true; D.i = Math.max(0, Math.min(D.steps.length - 1, i)); D.heard = '';
  voice.stop(); voice.say(checkin.SPEECH[D.steps[D.i]]);
}

onTimerDone((id, s) => {
  const D = S.ci; if (!D) return;
  if (id === checkin.timerId(D, 'hr') && s.taps >= 20) setCi('hr', s.taps);
  if (id === checkin.timerId(D, 'rr') && s.taps >= 4) setCi('rr', s.taps);
  if (route() === 'check-in' || route() === 'protocol') render();
});

function saveCheckin() {
  const D = S.ci, P = prof(), before = achievements(P, lastDay()).filter(b => b.unlocked).map(b => b.id), v = {};
  const stepOf = id => id === 'sys' || id === 'dia' ? 'bp' : id === 'mood' ? 'wellbeing' : id;
  for (const ind of IND) {
    if (ind.id === 'glu' && !D.gluDue) continue;
    const x = +D.v[ind.id];
    if (!D.skip[stepOf(ind.id)] && isFinite(x) && x >= ind.min && x <= ind.max) v[ind.id] = x;
  }
  const entry = { d: D.day, date: todayISO(), v, ex: Math.max(0, Math.min(300, +D.v.ex || 0)), q: { ...D.q }, sx: [...D.sx] };
  if (D.update) P.log[P.log.length - 1] = { ...P.log[P.log.length - 1], ...entry, sim: false };
  else P.log.push(entry);
  persist();
  const after = achievements(P, D.day).filter(b => b.unlocked);
  S.newBadges = after.filter(b => !before.includes(b.id));
  S.ci = null; S.justSaved = true; S.viewDay = null; S.sel = null; S.focus = null; resetTimers('ci-');
  const top = ctx().A.reduce((m, a) => Math.max(m, a.level), 0);
  if (top >= 2) sfx.klaxon(top); else sfx.fanfare();
  voice.say(['Cleared for duty.', 'Cleared for duty. One reading to watch.', 'Cleared with restrictions. Tell your crew medical officer today.', 'Not cleared. Contact flight surgeons now.'][top]);
  if (location.hash === '#today') render(); else location.hash = 'today';
}

function act(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, D = S.ci, P = prof();
  if (!['ci-step', 't-tap', 'snd', 'e-dir', 'ci-mic'].includes(a)) sfx.blip();
  switch (a) {
    case 'snd': setMuted(!isMuted()); if (!isMuted()) sfx.confirm(); break;
    case 'vc': voice.set(!voice.on); if (voice.on) voice.say('Voice coach on.', true); break;
    case 'ci-go': goStep(+b.dataset.i); break;
    case 'ci-next': goStep(D.i + 1); break;
    case 'ci-back': goStep(D.i - 1); break;
    case 'ci-step': { const id = b.dataset.id, ind = checkin.indOf(id); sfx.tick(); setCi(id, (+D.v[id] || 0) + ind.step * +b.dataset.dir); return; }
    case 'ci-set': D.v[b.dataset.id] = +b.dataset.val; sfx.select(); break;
    case 'ci-q': D.q[b.dataset.id] = +b.dataset.val; sfx.select(); break;
    case 'ci-sx': { const s = b.dataset.val, k = D.sx.indexOf(s); if (k >= 0) D.sx.splice(k, 1); else D.sx.push(s); break; }
    case 'ci-sx-none': D.sx = []; break;
    case 'ci-same': { const last = P.log[P.log.length - 1]; for (const id of checkin.fieldsOf(b.dataset.id)) { const val = id === 'ex' ? last.ex : last.v[id]; if (val != null) D.v[id] = val; } break; }
    case 'ci-skip': D.skip[b.dataset.id] = !D.skip[b.dataset.id]; break;
    case 'ci-save': saveCheckin(); return;
    case 'ci-mic': {
      if (voice.listening) { voice.stop(); break; }
      const step = D.steps[D.i];
      voice.hush(); b.setAttribute('aria-pressed', 'true'); sfx.blip();
      voice.listen(alts => {
        const r = parseSpoken(alts, step); D.heard = alts[0] || '';
        const ok = r && Object.entries(r).every(([id, x]) => { const ind = checkin.indOf(id); return x >= ind.min && x <= ind.max; });
        if (!ok) { sfx.error(); voice.say('Sorry, I did not catch a value. Please try again.', true); render(); return; }
        for (const [id, x] of Object.entries(r)) S.ci.v[id] = +(+x).toFixed(checkin.indOf(id).dec);
        sfx.confirm(); voice.say(step === 'bp' ? `Logged ${r.sys} over ${r.dia}.` : `Logged ${Object.values(r)[0]}.`, true);
        render(); setTimeout(() => { if (S.ci && S.ci.steps[S.ci.i] === step) { goStep(S.ci.i + 1); render(); } }, 1600);
      }, why => { if (why === 'not-allowed' || why === 'service-not-allowed') { S.ci.heard = 'microphone blocked'; render(); } else if (why !== 'end') { /* recognition ended without a result */ } const m = document.querySelector('.mic'); if (m) m.setAttribute('aria-pressed', 'false'); });
      return;
    }
    case 't-start': case 't-reset': if (timerAction(a, b.dataset.t)) break; return;
    case 't-tap': timerAction(a, b.dataset.t); return;
    case 'open': S.sel = b.dataset.id; S.focus = null; location.hash = 'body'; return;
    case 'sel': S.sel = b.dataset.id; render(); document.getElementById('detail')?.scrollIntoView({ block: 'start' }); return;
    case 'region': selectRegion(b.dataset.go); return;
    case 'focus-clear': S.focus = null; break;
    case 'cog-tab': cognitive.cogState.tab = b.dataset.id; break;
    case 'cog-save': {
      const G = cognitive.cogState, R = G.res, score = cognitiveScore({ pvt: R.pvt?.score, memory: R.memory?.score, tracking: R.tracking?.score });
      if (score == null) break;
      const beforeB = achievements(P, lastDay()).filter(x => x.unlocked).map(x => x.id);
      (P.cog = P.cog || []).push({ d: lastDay() || 1, date: todayISO(), pvt: R.pvt || null, memory: R.memory || null, tracking: R.tracking || null, score });
      G.res = {}; persist(); sfx.fanfare();
      const nb = achievements(P, lastDay()).filter(x => x.unlocked && !beforeB.includes(x.id));
      voice.say(`Battery saved. Cognitive score ${score}.${nb.length ? ' Achievement unlocked: ' + nb.map(x => x.name).join(', ') : ''}`);
      location.hash = 'today'; return;
    }
    case 'e-start': case 'e-dir': case 'bal-down': case 'x-save': {
      const day = lastDay() || 1, m = protocol.handle(a, b, P, day);
      if (a === 'e-dir') { const st = protocol.acuityState; if (!st.on) sfx.fanfare(); else sfx.select(); }
      if (m) { S.msg = m; if (a === 'x-save' || (a === 'e-dir' && !protocol.acuityState.on)) { persist(); sfx.confirm(); } }
      break;
    }
    case 'pb-save': {
      const pb = {};
      for (const i of IND) { const mv = document.getElementById('pb-m-' + i.id)?.value, sv = document.getElementById('pb-s-' + i.id)?.value; if (mv !== '' && sv !== '' && isFinite(+mv) && +sv > 0) pb[i.id] = { m: +mv, s: +sv }; }
      P.baseline = pb; persist(); S.msg = Object.keys(pb).length ? `Pre-flight baseline saved for ${Object.keys(pb).length} readings.` : 'No complete rows: enter both a mean and a spread above zero.'; break;
    }
    case 'pb-clear': delete P.baseline; persist(); S.msg = 'Pre-flight values cleared. Vital Sync will learn your baseline from your readings.'; break;
    case 'copy': {
      const t = document.getElementById(b.dataset.src), out = b.parentElement.querySelector('[role=status]');
      const done = ok => { if (out) out.textContent = ok ? 'Copied.' : 'Copy was blocked. Select the text and copy it by hand.'; };
      t.select(); try { navigator.clipboard.writeText(t.value).then(() => done(true), () => done(false)); } catch (err) { done(false); }
      return;
    }
    case 'download': {
      const out = b.parentElement.querySelector('[role=status]');
      try { const url = URL.createObjectURL(new Blob([document.getElementById('exp').value], { type: 'application/json' })), l = document.createElement('a'); l.href = url; l.download = `vital-sync-${P.name.replace(/\W+/g, '-').toLowerCase()}-log.json`; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); if (out) out.textContent = 'Download started.'; }
      catch (err) { if (out) out.textContent = 'Downloads are blocked here. Use Copy log instead.'; }
      return;
    }
    case 'demo-load': {
      const scn = document.getElementById('scn').value, i = db.profiles.findIndex(p => p.demo), keep = i >= 0 ? db.profiles[i].mode : 'mars', d = makeDemo(scn, 23);
      d.mode = keep; if (i >= 0) db.profiles[i] = d; else db.profiles.unshift(d);
      db.current = d.id; S.ci = null; S.ev = null; S.viewDay = null; S.sel = null; S.focus = null; persist(); location.hash = 'check-in'; return;
    }
    case 'replay-clear': S.viewDay = null; break;
    case 'eval': { const dp = db.profiles.find(p => p.demo) || { scn: 'cardio', seed: 23 }; S.ev = evaluate(simulate(dp.scn, 150, dp.seed), dp.scn); break; }
    case 'crew-add': {
      const name = (document.getElementById('newname').value || '').trim();
      if (!name) { S.msg = 'Enter a name or call sign for the new crew member.'; break; }
      const p = makeProfile(name); db.profiles.push(p); db.current = p.id; S.ci = null; S.viewDay = null; S.sel = null; S.focus = null; persist(); location.hash = 'check-in'; return;
    }
    case 'import': {
      try {
        const j = JSON.parse(document.getElementById('imp').value), arr = Array.isArray(j) ? j : j.entries, log = [];
        for (const e of arr) {
          const d = Math.round(+e.d); if (!(d >= 1)) continue;
          const v = {}; for (const ind of IND) { const x = e.v && +e.v[ind.id]; if (e.v && e.v[ind.id] != null && isFinite(x) && x >= ind.min && x <= ind.max) v[ind.id] = x; }
          log.push({ d, date: typeof e.date === 'string' ? e.date : null, v, ex: isFinite(+e.ex) ? +e.ex : null, q: e.q || null, sx: Array.isArray(e.sx) ? e.sx : [], sim: !!e.sim });
        }
        if (!log.length) throw new Error('empty');
        log.sort((x, y) => x.d - y.d); P.log = log; S.ci = null; S.viewDay = null; persist(); S.msg = `Loaded ${log.length} days into ${P.name}'s log.`;
      } catch (err) { S.msg = 'That text is not a Vital Sync log. Copy the whole log from the box above and paste it again.'; }
      break;
    }
    default: return;
  }
  render();
  if (['ci-go', 'ci-next', 'ci-back'].includes(a)) document.getElementById('q')?.focus({ preventScroll: true });
}

export function start() {
  starfield();
  document.addEventListener('click', act);
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.ci && S.ci) setCi(t.dataset.ci, t.value);
    else if (t.id === 'replay') { S.viewDay = +t.value; document.getElementById('replayo').textContent = t.value; }
  });
  document.addEventListener('change', e => {
    const t = e.target, P = prof();
    if (t.id === 'replay') { render(); document.getElementById('replay')?.focus(); }
    else if (t.id === 'crew') {
      if (t.value === '__add') { location.hash = 'profile'; setTimeout(() => document.getElementById('newname')?.focus(), 60); return; }
      db.current = t.value; S.ci = null; S.viewDay = null; S.sel = null; S.focus = null; persist();
      const r = defaultRoute(); if (location.hash === '#' + r) render(); else location.hash = r;
    }
    else if (t.id === 'mode') { P.mode = t.value; if (!modeOf(P).black) P.blackout = false; persist(); sfx.select(); render(); }
    else if (t.id === 'black') { P.blackout = t.checked; persist(); render(); }
    else if (t.dataset.take) { const d = +t.dataset.day; P.taken[d] = P.taken[d] || {}; P.taken[d][t.dataset.take] = t.checked; persist(); sfx.select(); if (route() === 'ground-link') render(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('.bignum')) { e.preventDefault(); document.querySelector('[data-act="ci-next"],[data-act="ci-save"]')?.click(); }
  });
  window.addEventListener('hashchange', () => { if (route() !== 'body') S.focus = null; render(); });
  setInterval(tickClock, 1000);
  render();
}
export const _timerState = timerState;
