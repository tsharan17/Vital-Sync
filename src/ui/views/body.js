// Body scan: 3D human with region status, readiness and the measurement schedule, then vitals tiles and one indicator in detail.
import { readiness, cadence, ADAPT } from '../../engine/index.js';
import { glyph, chip, fmt, fd, LV, LVS, reason, forecastText, rank } from '../format.js';
import { chart } from '../charts.js';
import { regionLevels } from '../assess.js';

const COLS = ['#3d59ab', '#2e6be6', '#f5a524', '#fc3d21'];

export function figure(L) {
  const st = k => `fill="${COLS[L[k]]}" fill-opacity="${[0.14, 0.3, 0.5, 0.65][L[k]]}" stroke="${COLS[L[k]]}" stroke-width="2"`;
  return `<svg viewBox="0 0 200 420" role="img" aria-label="Body outline coloured by status">
  <circle cx="100" cy="40" r="26" ${st('head')}/>
  <path d="M62 84q38-16 76 0l6 70H56z" ${st('chest')}/>
  <path d="M56 156h88l-4 62H60z" ${st('core')}/>
  <path d="M62 220h34l-4 180H70zM104 220h34l-8 180h-22z" ${st('legs')}/>
  <path d="M60 86 40 200l12 2 18-100M140 86l20 114-12 2-18-100" fill="#3d59ab" fill-opacity=".1" stroke="#3d59ab" stroke-width="1.5"/></svg>`;
}

export function detail(a, day) {
  const i = a.ind; if (a.none) return '';
  return `<section class="panel detail" id="detail"><div class="head"><h2>${i.name}</h2><span class="bigv num">${fmt(a.val, i)} <span class="small soft">${i.unit}</span></span>${chip(a.level)}<span class="small soft">Your baseline ${fmt(a.bm, i)} ± ${a.bsd.toFixed(Math.max(1, i.dec))}${a.provisional ? ' (still forming)' : ''}. Normal range ${i.g[0]} to ${i.g[1]}.</span></div>
  <p style="margin-bottom:12px;max-width:80ch">${reason(a) || forecastText(a)}</p>${chart(a, day)}
  <div class="grid cards" style="margin-top:16px">
  <div class="card"><h3>Why this matters</h3><p>${i.why}</p></div>
  <div class="card"><h3>How to measure</h3><p>${i.how}</p></div>
  <div class="card"><h3>Why it changes in space</h3><p>${i.space}</p></div>
  <div class="card"><h3>If it says Watch</h3><ul class="steps">${i.self.map(s => `<li>${s}</li>`).join('')}</ul></div>
  <div class="card"><h3>If it says Tell CMO</h3><ul class="steps">${i.cmo.map(s => `<li>${s}</li>`).join('')}</ul></div>
  <div class="card"><h3>While waiting for Earth</h3><ul class="steps">${i.now.map(s => `<li>${s}</li>`).join('')}</ul></div>
  <div class="card"><h3>Mission impact</h3><p>If this worsens, protect: ${i.tasks}.</p></div>
  <div class="card"><h3>NASA risks and range source</h3><ul class="plain">${i.risks.map(r => `<li><a href="${r[1]}">${r[0]}</a></li>`).join('')}<li class="small">Range: <a href="${i.src[1]}">${i.src[0]}</a></li></ul></div>
  </div></section>`;
}

function tiles(A, S, day) {
  const cap = 60;
  return rank(A).map(a => {
    const i = a.ind;
    let bar = `<div class="bar s${Math.max(1, a.level)}" aria-hidden="true">`;
    if (a.dEarly != null) bar += `<i style="left:${Math.min(100, a.dEarly / cap * 100)}%;right:${Math.max(0, 100 - Math.min(cap, a.dLate) / cap * 100)}%;min-width:6px"></i>`;
    bar += `<u style="left:${Math.min(99, a.loop / cap * 100)}%"></u></div>`;
    const txt = a.none ? 'No readings' : a.dEarly != null ? `Limit in ${fd(a.dEarly)} to ${fd(a.dLate)} days` : a.st ? 'Outside normal range' : 'No trend to a limit';
    return `<button class="tile" data-act="sel" data-id="${i.id}" aria-pressed="${S.sel === i.id}"><span class="tn"><span>${i.name}</span><span class="s${a.level}">${glyph(a.level)}</span></span><span class="tv num">${a.none ? '–' : fmt(a.val, i)} <small>${i.unit}</small></span><span class="tl"><span class="s${a.level}" style="font-weight:700">${LVS[a.level]}</span><span>${txt}</span></span>${bar}</button>`;
  }).join('');
}

export function view(ctx) {
  const { P, A, m, day, S } = ctx, a = A.find(x => x.ind.id === S.sel) || rank(A)[0], L = regionLevels(A, P, day, m), reg = a.ind.region;
  const rd = readiness(A, P.log, day), rl = rd.score >= 85 ? 0 : rd.score >= 70 ? 1 : rd.score >= 50 ? 2 : 3, C = 2 * Math.PI * 44;
  const call = (k, pos, t, d) => `<button class="call" style="${pos}" data-act="region" data-go="${k}" aria-pressed="${reg === k}"><span class="s${L[k]}">${glyph(L[k], 18)}</span><span><b>${t}</b><span class="d">${d}</span></span></button>`;
  const band = `<section class="band"><div class="wrap"><h1>Body scan</h1><p class="lede">Each region takes the status of its worst reading. Drag the body to turn it; select a region to see its readings.</p></div></section>`;
  return band + `<div class="wrap page grid">
  <div class="grid scan">
    <section class="panel holo"><div id="holo"></div>
      ${call('head', 'right:16px;top:8%', 'Head', 'Sleep and mood')}${call('chest', 'left:16px;top:24%', 'Chest', 'Heart and blood pressure')}${call('core', 'right:16px;top:44%', 'Core', 'Blood sugar, temperature, immune')}${call('legs', 'left:16px;top:64%', 'Legs', 'Bone and muscle')}${call('halo', 'right:16px;bottom:9%', 'Whole body', 'Radiation dose')}
      <p class="hint">Drag to turn the body</p></section>
    <div class="grid" style="align-content:start">
      <section class="panel"><div class="lbl">Crew readiness</div><div class="ring s${rl}"><svg viewBox="0 0 104 104" role="img" aria-label="Readiness ${rd.score} of 100"><circle cx="52" cy="52" r="44" fill="none" stroke="var(--mist)" stroke-width="9"/><circle cx="52" cy="52" r="44" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(C * rd.score / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 52 52)"/><text x="52" y="61" text-anchor="middle" style="font:700 28px var(--font);fill:var(--ink)">${rd.score}</text></svg><div><b>${rd.streak}-day check-in streak</b><p class="small soft">The score drops for caution or alert readings, drift and sleep debt.</p></div></div></section>
      <section class="panel"><div class="lbl">How often to measure, set by need</div><ul class="plain duelist">${A.map(x => `<li><span>${x.ind.name}</span><span class="s${x.level}" style="font-weight:${x.level ? 700 : 400}">${cadence(x)[0]}</span></li>`).join('')}</ul></section>
      <section class="panel tint small"><b>Region status</b><ul class="plain" style="margin-top:8px">${[0, 1, 2, 3].map(k => `<li style="display:flex;gap:8px;align-items:center"><span class="s${k}">${glyph(k)}</span>${LV[k]}</li>`).join('')}</ul></section>
    </div>
  </div>
  <section><h2 style="margin-bottom:14px">Vitals, most urgent first</h2><div class="grid tiles">${tiles(A, S, day)}</div><p class="small soft" style="margin-top:10px">Bar under each tile: the next 60 days. The coloured span is when the reading could cross a limit; the dark tick is when help from Earth takes effect.</p></section>
  ${detail(a, day)}</div>`;
}
