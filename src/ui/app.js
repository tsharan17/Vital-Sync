// Vital Sync app shell: state, routing, header and event handling.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { MODES, byId, analyzeAll, simulate, evaluate } from '../engine/index.js';
import { load, save, makeDemo, makeProfile, todayISO } from '../store.js';
import { esc } from './format.js';
import { regionLevels } from './assess.js';
import { Holo, onPick } from './holo.js';
import * as checkin from './views/checkin.js';
import * as today from './views/today.js';
import * as body from './views/body.js';
import * as trends from './views/trends.js';
import * as systems from './views/systems.js';
import * as comms from './views/comms.js';
import * as about from './views/about.js';
import * as validation from './views/validation.js';

const NAV = [['check-in', 'Check in'], ['today', 'Today'], ['body', 'Body scan'], ['trends', 'Trends'], ['systems', 'Systems'], ['ground-link', 'Ground link'], ['about', 'About']];
const VIEWS = { 'check-in': checkin, today, body, trends, systems, 'ground-link': comms, about, validation };
const NEEDS_DATA = ['today', 'body', 'trends', 'systems', 'ground-link'];
const MARK = '<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="16" fill="#0b3d91"/><ellipse cx="18" cy="18" rx="17" ry="6.5" fill="none" stroke="#fff" stroke-width="1.6" transform="rotate(-24 18 18)"/><path d="M6 19h6l2.5-5 4 10 3-7 1.6 2H30" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="30" cy="11" r="2.6" fill="#fc3d21"/></svg>';

const db = load();
const S = { ci: null, justSaved: false, sel: null, viewDay: null, ev: null, msg: '', lastRoute: null };
const prof = () => db.profiles.find(p => p.id === db.current) || db.profiles[0];
const lastDay = () => { const L = prof().log; return L.length ? L[L.length - 1].d : 0; };
const modeOf = p => MODES.find(x => x.id === p.mode) || MODES[3];
const defaultRoute = () => { const L = prof().log, last = L[L.length - 1]; return last && last.date === todayISO() ? 'today' : 'check-in'; };
const route = () => { const h = location.hash.slice(1); return VIEWS[h] ? h : defaultRoute(); };
const persist = () => save(db);

function ctx(forDay) {
  const P = prof(), m = modeOf(P), ld = lastDay(), day = forDay ?? Math.min(S.viewDay ?? ld, ld);
  return { P, db, m, S, day, lastDay: ld, A: analyzeAll(P.log, day, m, P.blackout) };
}

function header(v, P, m) {
  return `<a class="sr" href="#main">Skip to content</a><header class="hdr"><div class="wrap">
  <a class="brand" href="#check-in">${MARK}Vital Sync</a>
  <nav class="nav" aria-label="Main">${NAV.map(([id, t]) => `<a href="#${id}" ${id === v ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  </div></header>
  <div class="ctlbar"><div class="wrap ctl">
    <label for="crew">Crew member</label><select id="crew">${db.profiles.map(p => `<option value="${p.id}" ${p.id === P.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}<option value="__add">Add crew member…</option></select>
    <label for="mode">Location</label><select id="mode">${MODES.map(x => `<option value="${x.id}" ${x.id === m.id ? 'selected' : ''}>${x.name}</option>`).join('')}</select>
    ${m.black ? `<label class="chk"><input type="checkbox" id="black" ${P.blackout ? 'checked' : ''}>${m.black}-day communication blackout ahead</label>` : ''}
    ${P.demo ? '<a class="demo" href="#validation">Demo history: days before today are simulated</a>' : ''}
  </div></div>`;
}

function render() {
  const v = route(), c = ctx(), P = c.P;
  if (v === 'check-in' && !S.ci) S.ci = checkin.initDraft(P, ctx(lastDay()).A);
  if (v === 'check-in') Object.assign(c, { A: ctx(lastDay()).A, day: lastDay() });
  if (!S.sel) S.sel = (c.A.slice().sort((x, y) => y.level - x.level)[0] || {}).ind?.id;
  let main;
  if (!P.log.length && NEEDS_DATA.includes(v)) main = `<section class="band"><div class="wrap"><h1>No readings yet.</h1><p class="lede">${esc(P.name)} has not checked in. Your first check-in takes about three minutes.</p><p style="margin-top:24px"><a class="btn onband big" href="#check-in">Start your first check-in</a></p></div></section>`;
  else main = VIEWS[v].view(c);
  const replay = S.viewDay != null && S.viewDay < lastDay() && v !== 'check-in' ? `<div class="note info wrap" style="margin-top:16px;max-width:1192px">Viewing mission day ${S.viewDay}. <button class="btn ghost" data-act="replay-clear">Back to the latest day</button></div>` : '';
  document.getElementById('app').innerHTML = header(v, P, c.m) + `<main id="main" tabindex="-1">${replay}${main}</main>
  <footer class="foot"><div class="wrap"><span>Vital Sync by Team V-Sync. Decision support, not diagnosis. Built for the NASA Space Apps Challenge 2026; not affiliated with or endorsed by NASA.</span><span><a href="#validation">Demo and validation</a> · Data stays on this device</span></div></footer>`;
  if (v !== S.lastRoute) { window.scrollTo(0, 0); S.lastRoute = v; }
  S.justSaved = false; S.msg = '';
  const h = document.getElementById('holo');
  if (h) {
    const a = c.A.find(x => x.ind.id === S.sel) || c.A[0], L = regionLevels(c.A, P, c.day, c.m);
    let ok = false; try { ok = Holo.mount(h, L, a.ind.region); } catch (e) { ok = false; }
    if (!ok) h.innerHTML = body.figure(L);
  }
}

function selectRegion(k) {
  if (k === 'halo' || k === 'legs') { location.hash = 'systems'; return; }
  const c = ctx(), A = c.A.filter(a => a.ind.region === k && !a.none).sort((x, y) => y.level - x.level);
  if (A.length) { S.sel = A[0].ind.id; render(); document.getElementById('detail')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
}
onPick(selectRegion);

function setCi(id, raw) {
  const ind = checkin.indOf(id), x = +raw;
  if (!isFinite(x)) return;
  S.ci.v[id] = +Math.min(ind.max, Math.max(ind.min, x)).toFixed(ind.dec);
  checkin.live(id, S.ci, ctx(lastDay()).A);
}

function saveCheckin() {
  const D = S.ci, P = prof(), v = {};
  for (const id of ['hr', 'sys', 'dia', 'temp', 'glu', 'sleep', 'mood']) {
    const skip = D.skip[id === 'sys' || id === 'dia' ? 'bp' : id], ind = byId(id), x = +D.v[id];
    if (!skip && isFinite(x) && x >= ind.min && x <= ind.max) v[id] = x;
  }
  const entry = { d: D.day, date: todayISO(), v, ex: Math.max(0, Math.min(300, +D.v.ex || 0)) };
  if (D.update) P.log[P.log.length - 1] = { ...P.log[P.log.length - 1], ...entry, sim: false };
  else P.log.push(entry);
  persist();
  S.ci = null; S.justSaved = true; S.viewDay = null; S.sel = null;
  if (location.hash === '#today') render(); else location.hash = 'today';
}

function act(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, D = S.ci, P = prof();
  const step = D && D.steps[D.i];
  switch (a) {
    case 'ci-go': D.seen[step] = true; D.i = +b.dataset.i; break;
    case 'ci-next': D.seen[step] = true; D.i = Math.min(D.steps.length - 1, D.i + 1); break;
    case 'ci-back': D.i = Math.max(0, D.i - 1); break;
    case 'ci-step': { const id = b.dataset.id, ind = checkin.indOf(id); setCi(id, (+D.v[id] || 0) + ind.step * +b.dataset.dir); return; }
    case 'ci-set': D.v[b.dataset.id] = +b.dataset.val; break;
    case 'ci-same': { const last = P.log[P.log.length - 1]; for (const id of checkin.fieldsOf(b.dataset.id)) { const val = id === 'ex' ? last.ex : last.v[id]; if (val != null) D.v[id] = val; } break; }
    case 'ci-skip': D.skip[b.dataset.id] = !D.skip[b.dataset.id]; break;
    case 'ci-save': saveCheckin(); return;
    case 'open': S.sel = b.dataset.id; location.hash = 'body'; return;
    case 'sel': S.sel = b.dataset.id; render(); document.getElementById('detail')?.scrollIntoView({ block: 'start' }); return;
    case 'region': selectRegion(b.dataset.go); return;
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
      db.current = d.id; S.ci = null; S.ev = null; S.viewDay = null; S.sel = null; persist(); location.hash = 'check-in'; return;
    }
    case 'replay-clear': S.viewDay = null; break;
    case 'eval': { const dp = db.profiles.find(p => p.demo) || { scn: 'cardio', seed: 23 }; S.ev = evaluate(simulate(dp.scn, 150, dp.seed), dp.scn); break; }
    case 'crew-add': {
      const name = (document.getElementById('newname').value || '').trim();
      if (!name) { S.msg = 'Enter a name or call sign for the new crew member.'; break; }
      const p = makeProfile(name); db.profiles.push(p); db.current = p.id; S.ci = null; S.viewDay = null; S.sel = null; persist(); location.hash = 'check-in'; return;
    }
    case 'import': {
      try {
        const j = JSON.parse(document.getElementById('imp').value), arr = Array.isArray(j) ? j : j.entries, log = [];
        for (const e of arr) {
          const d = Math.round(+e.d); if (!(d >= 1)) continue;
          const v = {}; for (const id of ['hr', 'sys', 'dia', 'temp', 'glu', 'sleep', 'mood']) { const ind = byId(id), x = e.v && +e.v[id]; if (e.v && e.v[id] != null && isFinite(x) && x >= ind.min && x <= ind.max) v[id] = x; }
          log.push({ d, date: typeof e.date === 'string' ? e.date : null, v, ex: isFinite(+e.ex) ? +e.ex : null, sim: !!e.sim });
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
      if (t.value === '__add') { location.hash = 'validation'; setTimeout(() => document.getElementById('newname')?.focus(), 50); return; }
      db.current = t.value; S.ci = null; S.viewDay = null; S.sel = null; persist();
      const r = defaultRoute(); if (location.hash === '#' + r) render(); else location.hash = r;
    }
    else if (t.id === 'mode') { P.mode = t.value; if (!modeOf(P).black) P.blackout = false; persist(); render(); }
    else if (t.id === 'black') { P.blackout = t.checked; persist(); render(); }
    else if (t.dataset.take) { const d = +t.dataset.day; P.taken[d] = P.taken[d] || {}; P.taken[d][t.dataset.take] = t.checked; persist(); if (route() === 'ground-link') render(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('.bignum')) { e.preventDefault(); document.querySelector('[data-act="ci-next"],[data-act="ci-save"]')?.click(); }
  });
  window.addEventListener('hashchange', render);
  render();
}
