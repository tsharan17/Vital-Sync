// Body scan: 3D human with region status, readiness and the measurement schedule, then vitals tiles and one indicator in detail.
import { cadence, R, missionReadiness } from '../../engine/index.js';
import { gauge } from '../hud.js';
import { glyph, chip, fmt, fd, LV, LVS, reason, forecastText, rank } from '../format.js';
import { chart } from '../charts.js';
import { regionLevels } from '../assess.js';
import { tutorial } from '../tutorials.js';
import { badgesHTML } from './profile.js';

const COLS = ['var(--s0-fill)', 'var(--s1-fill)', 'var(--s2-fill)', 'var(--s3-fill)'];
export const REG = {
  head: { name: 'Neurological', organ: 'Brain, eyes and inner ear. Sleep, mood, fatigue and attention depend on them; fluid shifting toward the head in microgravity can also change vision.', risks: [['Behavioral conditions and psychiatric disorders', R + 'risk-of-behavioral-conditions-and-psychiatric-disorders/'], ['Inadequate sleep and irregular schedules', R + 'risk-from-inadequate-sleep-and-irregular-schedules/']] },
  chest: { name: 'Cardiopulmonary', organ: 'Heart, blood vessels and lungs. In microgravity the heart works against less load and can shrink; blood pressure and breathing show strain early.', risks: [['Cardiovascular adaptations', R + 'risk-of-cardiovascular-adaptations/'], ['Reduced cardiorespiratory and musculoskeletal fitness', R + 'risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/']] },
  core: { name: 'Core and immune', organ: 'Metabolism, temperature control and the immune system. Spaceflight stress can weaken immune defence and wake dormant viruses.', risks: [['Altered immune system responses', R + 'risk-of-altered-immune-system-responses/'], ['Inadequate food and nutrition', R + 'risk-of-inadequate-food-and-nutrition/']] },
  legs: { name: 'Musculoskeletal', organ: 'Weight-bearing bones and leg muscles. Without load, bones lose 1% to 1.5% of density a month and muscles weaken unless you exercise daily.', risks: [['Spaceflight-induced bone changes', R + 'risk-of-spaceflight-induced-bone-changes/'], ['Reduced cardiorespiratory and musculoskeletal fitness', R + 'risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/']] }
};

export function figure(L) {
  const st = k => `fill="${COLS[L[k]]}" fill-opacity="${[0.14, 0.3, 0.5, 0.65][L[k]]}" stroke="${COLS[L[k]]}" stroke-width="2"`;
  return `<svg viewBox="0 0 200 420" role="img" aria-label="Body outline coloured by status">
  <circle cx="100" cy="40" r="26" ${st('head')}/>
  <path d="M62 84q38-16 76 0l6 70H56z" ${st('chest')}/>
  <path d="M56 156h88l-4 62H60z" ${st('core')}/>
  <path d="M62 220h34l-4 180H70zM104 220h34l-8 180h-22z" ${st('legs')}/>
  <path d="M60 86 40 200l12 2 18-100M140 86l20 114-12 2-18-100" fill="var(--blue)" fill-opacity=".1" stroke="var(--blue)" stroke-width="1.5"/></svg>`;
}

export function detail(a, day) {
  const i = a.ind; if (a.none) return '';
  return `<section class="panel detail" id="detail"><div class="head"><h2>${i.name}</h2><span class="bigv num">${fmt(a.val, i)} <span class="small soft">${i.unit}</span></span>${chip(a.level)}<span class="small soft">Your ${a.preflight ? 'pre-flight' : 'learned'} baseline ${fmt(a.bm, i)} ± ${a.bsd.toFixed(Math.max(1, i.dec))}${a.provisional ? ' (still forming)' : ''}. Normal range ${i.g[0]} to ${i.g[1]}.</span></div>
  <p style="margin-bottom:12px;max-width:80ch">${reason(a) || forecastText(a)}</p>${chart(a, day)}${i.tool ? `<div style="margin-top:16px">${tutorial(i)}</div>` : ''}
  <div class="grid cards" style="margin-top:16px">
  <div class="card"><h3>Why this matters</h3><p>${i.why}</p></div>
  <div class="card"><h3>How to measure</h3>${i.tut ? `<ol class="steps" style="padding-left:18px">${i.tut.map(t => `<li>${t}</li>`).join('')}</ol>` : `<p>${i.how}</p>`}</div>
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

function dcard(k, A, L) {
  const r = REG[k]; if (!r) return '';
  const rows = A.filter(a => a.ind.region === k && !a.none);
  return `<div class="dcard" role="dialog" aria-label="${r.name} diagnostics"><button class="x" data-act="focus-clear" aria-label="Close">✕</button>
    <div class="lbl">Diagnostic telemetry</div><h3><span class="s${L[k]}">${glyph(L[k], 20)}</span>${r.name}<span class="chip s${L[k]}" style="margin-left:6px">${LVS[L[k]]}</span></h3>
    <p class="small" style="margin-top:8px">${r.organ}</p>
    ${rows.length ? `<ul>${rows.map(a => `<li><button class="btn ghost" style="min-height:32px;padding:2px 6px" data-act="sel" data-id="${a.ind.id}">${a.ind.name}</button> <span class="num s${a.level}">${fmt(a.val, a.ind)} ${a.ind.unit}</span></li>`).join('')}</ul>` : `<p class="small soft" style="margin-top:8px">${k === 'legs' ? 'Tracked through the exercise log and the weekly strength and balance tests.' : 'No readings yet.'}</p>`}
    <p class="small" style="margin-top:10px"><b>NASA risks:</b> ${r.risks.map(x => `<a href="${x[1]}">${x[0]}</a>`).join('; ')}</p></div>`;
}

export function view(ctx) {
  const { P, A, m, day, S } = ctx, a = A.find(x => x.ind.id === S.sel) || rank(A)[0], L = regionLevels(A, P, day, m), reg = S.focus || a.ind.region;
  const rd = missionReadiness(A, P.log, day, P.cog);
  const call = (k, pos, t, d) => `<button class="call" style="${pos}" data-act="region" data-go="${k}" aria-pressed="${reg === k}"><span class="s${L[k]}">${glyph(L[k], 18)}</span><span><b>${t}</b><span class="d">${d}</span></span></button>`;
  const band = `<section class="band"><div class="wrap"><div class="frame"><div class="kicker">HOLOGRAPHIC DIAGNOSTIC SCAN</div><h1>Body scan</h1><p class="lede">Each hotspot takes the status of its worst reading. Drag to turn the body; select a hotspot to zoom in and open its diagnostic telemetry.</p></div></div></section>`;
  return band + `<div class="wrap page grid">
  <div class="grid scan">
    <section class="panel br holo"><div id="holo"></div>
      ${call('head', 'right:16px;top:7%', 'Neurological', 'Sleep, fatigue, mood')}${call('chest', 'left:16px;top:22%', 'Cardiopulmonary', 'Heart, pressure, oxygen, breathing')}${call('core', 'right:16px;top:42%', 'Core and immune', 'Sugar, temperature')}${call('legs', 'left:16px;top:60%', 'Musculoskeletal', 'Bone and muscle')}${call('halo', 'left:16px;top:78%', 'Whole body', 'Radiation dose')}
      ${S.focus ? dcard(S.focus, A, L) : '<p class="hint">Drag to turn · select a hotspot</p>'}</section>
    <div class="grid" style="align-content:start">
      <section class="panel"><div class="lbl">Mission readiness</div>${gauge(rd)}</section>
      <section class="panel"><div class="lbl">How often to measure, set by need</div><ul class="plain duelist">${A.map(x => `<li><span>${x.ind.name}</span><span class="s${x.level}" style="font-weight:${x.level ? 700 : 400}">${cadence(x)[0]}</span></li>`).join('')}</ul></section>
    </div>
  </div>
  <section><h2 style="margin-bottom:14px">Vitals, most urgent first</h2><div class="grid tiles">${tiles(A, S, day)}</div><p class="small soft" style="margin-top:10px">Bar under each tile: the next 60 days. The coloured span is when the reading could cross a limit; the white tick is when help from Earth takes effect.</p></section>
  ${detail(a, day)}
  <section><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:14px"><h2>Trophy room</h2><a href="#profile">Ranks and pre-flight baseline</a></div>${badgesHTML(P, day)}</section></div>`;
}
