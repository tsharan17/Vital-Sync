// Guided daily check-in. One reading per step, most useful readings first, then a review before saving to the log.
import { IND, byId, statusOf, consultDays } from '../../engine/index.js';
import { todayISO } from '../../store.js';
import { esc, fmt, glyph, chip, check, ST_LEVEL } from '../format.js';

const RANGE = { hr: [35, 135], sys: [70, 175], dia: [40, 110], glu: [50, 190], temp: [34.5, 39.5], sleep: [3, 11], ex: [0, 240] };
const NAME = { hr: 'Heart rate', bp: 'Blood pressure', temp: 'Temperature', glu: 'Blood sugar', sleep: 'Sleep', mood: 'Mood', ex: 'Exercise', review: 'Review and save' };
const Q = {
  hr: 'What is your resting heart rate?', bp: 'What is your blood pressure?', temp: 'What is your body temperature?',
  glu: 'What is your fasting blood sugar?', sleep: 'How long did you sleep last night?', mood: 'How do you feel today?',
  ex: 'How long did you exercise today?', review: 'Check your readings, then save them to your log.'
};
const EX = { id: 'ex', name: 'Exercise', unit: 'min', dec: 0, step: 5, min: 0, max: 300 };
const indOf = id => id === 'ex' ? EX : byId(id);
const fieldsOf = id => id === 'bp' ? ['sys', 'dia'] : [id];

export function initDraft(P, A) {
  const last = P.log[P.log.length - 1], update = !!last && last.date === todayISO();
  const v = {};
  for (const i of IND) v[i.id] = last && last.v[i.id] != null ? last.v[i.id] : +((i.g[0] + i.g[1]) / 2).toFixed(i.dec);
  v.ex = last && last.ex != null ? last.ex : 90;
  const lv = id => (A.find(a => a.ind.id === id) || { level: 0 }).level;
  const lvl = id => Math.max(...fieldsOf(id).map(lv));
  const ordered = ['hr', 'bp', 'temp', 'glu', 'sleep', 'mood'].map((id, k) => ({ id, k, l: lvl(id) })).sort((a, b) => b.l - a.l || a.k - b.k);
  return {
    steps: ordered.map(x => x.id).concat(['ex', 'review']), flagged: Object.fromEntries(ordered.map(x => [x.id, x.l])),
    i: 0, v, skip: {}, seen: {}, update, day: update ? last.d : (last ? last.d + 1 : 1)
  };
}

function verdict(id, val, A) {
  if (id === 'ex') { const pct = Math.round(val / 120 * 100); return { l: val >= 120 ? 0 : val >= 90 ? 1 : 2, t: `${pct}% of the 120-minute daily target` }; }
  const ind = byId(id), st = statusOf(ind, val), a = A.find(x => x.ind.id === id);
  let t = ['In your normal range', 'In the caution range', 'In the alert range'][st];
  if (a && !a.none && !a.provisional) {
    const d = val - a.bm, th = Math.max(ind.step, a.bsd * 0.5);
    t += Math.abs(d) < th ? `, close to your usual ${fmt(a.bm, ind)}` : `, ${fmt(Math.abs(d), ind)} ${ind.unit} ${d > 0 ? 'above' : 'below'} your usual ${fmt(a.bm, ind)}`;
  }
  return { l: ST_LEVEL[st], t };
}

function zones(ind) {
  const [lo, hi] = RANGE[ind.id], P = x => Math.max(0, Math.min(100, (x - lo) / (hi - lo) * 100));
  if (ind.id === 'ex') return `<span class="z2" style="width:${P(90)}%"></span><span class="z1" style="width:${P(120) - P(90)}%"></span><span class="z0" style="width:${100 - P(120)}%"></span>`;
  const cuts = [lo, ind.a[0], ind.g[0], ind.g[1], ind.a[1], hi].map(x => Math.max(lo, Math.min(hi, x)));
  const cls = ['z2', 'z1', 'z0', 'z1', 'z2'];
  return cls.map((c, k) => `<span class="${c}" style="width:${P(cuts[k + 1]) - P(cuts[k])}%"></span>`).join('');
}
const pct = (id, x) => { const [lo, hi] = RANGE[id]; return Math.max(0, Math.min(100, (x - lo) / (hi - lo) * 100)); };

function reading(id, D, A, label) {
  const ind = indOf(id), val = D.v[id], a = A.find(x => x.ind.id === id), [lo, hi] = RANGE[id], vd = verdict(id, val, A);
  const marks = [];
  if (id === 'ex') marks.push([120, 'target 120']);
  else if (a && !a.none) { if (!a.provisional) marks.push([a.bm, 'your usual']); }
  return `<div class="field-block">
  ${label ? `<div class="lbl">${label}</div>` : ''}
  <div class="reading">
    <button class="pm" data-act="ci-step" data-id="${id}" data-dir="-1" aria-label="Lower ${esc(ind.name)} by ${ind.step}">−</button>
    <input class="bignum" id="val-${id}" data-ci="${id}" type="number" inputmode="decimal" step="${ind.step}" min="${ind.min}" max="${ind.max}" value="${val}" aria-label="${esc(ind.name)} in ${ind.unit}">
    <button class="pm" data-act="ci-step" data-id="${id}" data-dir="1" aria-label="Raise ${esc(ind.name)} by ${ind.step}">+</button>
    <span class="unit">${ind.unit}</span>
  </div>
  <div class="ruler">
    <div class="zones" aria-hidden="true">${zones(ind)}</div>
    ${marks.map(([x, t]) => `<span class="mk" style="left:${pct(id, x)}%">${t}</span>`).join('')}
    <span class="needle" id="needle-${id}" style="left:${pct(id, val)}%"></span>
    <input type="range" id="rng-${id}" data-ci="${id}" min="${lo}" max="${hi}" step="${ind.step}" value="${Math.max(lo, Math.min(hi, val))}" aria-label="Drag to set ${esc(ind.name)}">
    <div class="ends" aria-hidden="true"><span>${lo}</span><span>${hi}</span></div>
  </div>
  <p class="verdict s${vd.l}" id="verdict-${id}" aria-live="polite">${glyph(vd.l, 18)}<span>${vd.t}</span></p>
  </div>`;
}

function stageBody(step, D, A, P) {
  if (step === 'review') {
    const rows = ['hr', 'sys', 'dia', 'temp', 'glu', 'sleep', 'mood'].map(id => {
      const ind = byId(id), sk = D.skip[id === 'sys' || id === 'dia' ? 'bp' : id], v = D.v[id];
      return `<tr><td>${ind.name}</td><td class="num">${sk ? 'Not measured' : fmt(v, ind) + ' <span class="small soft">' + ind.unit + '</span>'}</td><td>${sk ? '' : chip(ST_LEVEL[statusOf(ind, v)]).replace('Nominal', 'Normal range').replace('Tell CMO', 'Caution range').replace('Contact ground', 'Alert range')}</td><td><button class="btn ghost" data-act="ci-go" data-i="${D.steps.indexOf(id === 'sys' || id === 'dia' ? 'bp' : id)}">Edit</button></td></tr>`;
    }).join('') + `<tr><td>Exercise</td><td class="num">${D.v.ex} <span class="small soft">min</span></td><td></td><td><button class="btn ghost" data-act="ci-go" data-i="${D.steps.indexOf('ex')}">Edit</button></td></tr>`;
    return `<div class="scroll"><table class="rev"><thead><tr><th>Reading</th><th>Value</th><th>Range check</th><th><span class="sr">Edit</span></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="soft">Saving adds these readings to ${esc(P.name)}'s log as mission day ${D.day}. The app then compares them with your baseline and updates every forecast.</p>`;
  }
  const ind = step === 'bp' ? byId('sys') : indOf(step), lastE = P.log[P.log.length - 1];
  if (D.skip[step]) return `<p class="skipped">You marked this reading as not measured today. It will be left out of today's log entry.</p><div class="quick"><button data-act="ci-skip" data-id="${step}" aria-pressed="true">Measure it after all</button></div>`;
  let body;
  if (step === 'bp') body = `<div class="bp">${reading('sys', D, A, 'Systolic, the upper number')}${reading('dia', D, A, 'Diastolic, the lower number')}</div>`;
  else if (step === 'mood') {
    const vd = verdict('mood', D.v.mood, A);
    body = `<div class="moods" role="group" aria-label="Mood from 1 to 10">${Array.from({ length: 10 }, (_, k) => k + 1).map(n => `<button data-act="ci-set" data-id="mood" data-val="${n}" aria-pressed="${Math.round(D.v.mood) === n}">${n}</button>`).join('')}</div>
    <div class="moodends"><span>1: very low</span><span>10: very good</span></div>
    <p class="verdict s${vd.l}" id="verdict-mood" aria-live="polite">${glyph(vd.l, 18)}<span>${vd.t}</span></p>`;
  } else body = reading(step, D, A);
  const lastVal = lastE ? (step === 'ex' ? lastE.ex : step === 'bp' ? (lastE.v.sys != null ? lastE.v.sys + '/' + lastE.v.dia : null) : lastE.v[step]) : null;
  const quick = `<div class="quick">${lastVal != null && !D.update ? `<button data-act="ci-same" data-id="${step}">Same as last time (${lastVal})</button>` : ''}${step !== 'ex' ? `<button data-act="ci-skip" data-id="${step}" aria-pressed="false">I can't measure this today</button>` : ''}</div>`;
  const how = step === 'ex' ? `<div class="howto"><div><b>How to count it</b>Add up treadmill, cycle and resistance sessions. Warm-up counts; rest between sets does not.</div><div><b>Why it matters in space</b>Without gravity, weight-bearing bones lose 1% to 1.5% of their density a month. Daily exercise is the main countermeasure.</div></div>`
    : `<div class="howto"><div><b>How to measure</b>${ind.how}</div><div><b>Why it matters in space</b>${ind.space}</div></div>`;
  return body + quick + how;
}

export function view(ctx) {
  const { P, A, m, S } = ctx, D = S.ci, step = D.steps[D.i], next = D.steps[D.i + 1], done = D.steps.filter(s => D.seen[s]).length;
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const first = D.steps.filter(s => D.flagged[s] >= 1);
  const band = `<section class="band"><div class="wrap">
    <h1>${D.update ? `Update today's check-in` : `Day ${D.day} check-in`}</h1>
    <p class="lede">${greet}, ${esc(P.name)}. Seven readings and your exercise time, about three minutes. ${first.length ? `${NAME[first[0]]} comes first today because it has been drifting.` : 'Your readings have been steady, so they come in the usual order.'}</p>
    <div class="facts"><span>Location<b>${m.name}</b></span><span>One-way signal to Earth<b>${m.oneWayS < 60 ? m.oneWayS.toFixed(1) + ' s' : (m.oneWayS / 60).toFixed(0) + ' min'}</b></span><span>Three exchanges with flight surgeons<b>${(consultDays(m) * 24).toFixed(0)} h</b></span></div>
    <div class="prog" aria-label="Step ${D.i + 1} of ${D.steps.length}">${D.steps.map((s, k) => `<i class="${k === D.i ? 'cur' : D.seen[s] ? 'done' : ''}"></i>`).join('')}</div>
  </div></section>`;
  const nav = `<nav class="panel tint stepsnav" aria-label="Check-in steps"><ol>${D.steps.map((s, k) => `<li><button data-act="ci-go" data-i="${k}" class="${D.seen[s] && k !== D.i ? 'done' : ''}" ${k === D.i ? 'aria-current="step"' : ''}><span class="n">${D.seen[s] && k !== D.i ? '✓' : k + 1}</span><span>${NAME[s]}</span>${D.flagged[s] >= 1 ? `<span class="s${D.flagged[s]}" title="Drifting">${glyph(D.flagged[s], 14)}</span>` : '<span></span>'}</button></li>`).join('')}</ol>
    <p class="small soft" style="margin-top:14px;padding:0 12px">${done} of ${D.steps.length} steps done. Readings that are drifting are asked first.</p></nav>`;
  const flag = D.flagged[step] >= 1 ? `<p class="why-first s${D.flagged[step]}">${glyph(D.flagged[step], 16)}This reading has been drifting from your baseline, so it comes first.</p>` : '';
  const stage = `<section class="panel stage" aria-labelledby="q">${flag}<h2 class="q" id="q" tabindex="-1">${Q[step]}</h2>${stageBody(step, D, A, P)}
    <div class="stagebar"><button class="btn" data-act="ci-back" ${D.i === 0 ? 'disabled' : ''}>Back</button>
    ${step === 'review' ? `<button class="btn primary big" data-act="ci-save">${D.update ? `Update day ${D.day} in my log` : `Save day ${D.day} to my log`}</button>` : `<button class="btn primary big" data-act="ci-next">Next: ${NAME[next]}</button>`}</div></section>`;
  return band + `<div class="wrap page"><div class="grid ci">${nav}${stage}</div></div>`;
}

// Update one reading in place while dragging or typing, without re-rendering the page.
export function live(id, D, A) {
  const ind = indOf(id), val = D.v[id], n = document.getElementById('needle-' + id), r = document.getElementById('rng-' + id), inp = document.getElementById('val-' + id), vd = document.getElementById('verdict-' + id);
  if (n) n.style.left = pct(id, val) + '%';
  if (r && document.activeElement !== r) r.value = val;
  if (inp && document.activeElement !== inp) inp.value = val;
  if (vd) { const x = verdict(id, val, A); vd.className = 'verdict s' + x.l; vd.innerHTML = glyph(x.l, 18) + '<span>' + x.t + '</span>'; }
  return ind;
}
export { indOf, fieldsOf };
