// Pre-flight health clearance: guided daily check-in with procedure timers, instrument tutorials and voice logging.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { IND, byId, statusOf, consultDays } from '../../engine/index.js';
import { todayISO } from '../../store.js';
import { esc, fmt, glyph, chip, ST_LEVEL } from '../format.js';
import { timerHTML } from '../timer.js';
import { tutorial } from '../tutorials.js';
import { voice } from '../audioGuide.js';

const RANGE = { hr: [35, 135], sys: [70, 175], dia: [40, 110], spo2: [80, 100], rr: [6, 32], glu: [50, 190], temp: [34.5, 39.5], sleep: [3, 11], ex: [0, 240] };
export const NAME = { hr: 'Heart rate', bp: 'Blood pressure', spo2: 'Blood oxygen', rr: 'Breathing rate', temp: 'Temperature', glu: 'Blood sugar', sleep: 'Sleep', fatigue: 'Fatigue', wellbeing: 'Wellbeing', symptoms: 'Symptoms', ex: 'Exercise', review: 'Review and save' };
const Q = {
  hr: 'What is your resting heart rate?', bp: 'What is your blood pressure?', spo2: 'What is your blood oxygen level?', rr: 'How fast are you breathing at rest?',
  temp: 'What is your body temperature?', glu: 'What is your fasting blood sugar?', sleep: 'How long did you sleep last night?', fatigue: 'How alert do you feel right now?',
  wellbeing: 'How are you doing today?', symptoms: 'Any of these symptoms today?', ex: 'How long did you exercise today?', review: 'Check your readings, then log your clearance.'
};
export const SPEECH = {
  hr: 'Beginning heart rate check. Find your pulse on the thumb side of your wrist, then start the timer.',
  bp: 'Beginning blood pressure check. Rest your arm at heart level. Start the five minute pre-test rest.',
  spo2: 'Beginning blood oxygen check. Insert your finger fully into the clip.',
  rr: 'Beginning breathing rate count. Breathe naturally, and tap once for each breath.',
  temp: 'Beginning temperature check. Use the same site as yesterday.',
  glu: 'Beginning fasting blood sugar check. Wash and dry your hands first.',
  sleep: 'How many hours did you actually sleep last night?', fatigue: 'Pick the statement that matches how alert you feel.',
  wellbeing: 'A brief wellbeing check. Your answers stay private.', symptoms: 'Select any symptoms you have today.',
  ex: 'How many minutes did you exercise today?', review: 'Check your readings, then log your clearance.'
};
const TIMERS = {
  hr: [{ k: 'hr', seconds: 60, title: '60-second pulse count', desc: 'Press start and tap once for every beat you feel. A chime sounds at 30 seconds and a bell at 60; your count fills in automatically.', art: 'heart', anim: 'beat', bpm: 65, tap: 'beats', chimeAt: [30], tick: true, runLabel: 'Counting', startSay: 'Starting the sixty second pulse count. Tap once for each beat.', doneSay: 'Time. Your beat count has been entered.' }],
  bp: [
    { k: 'bp-rest', seconds: 300, title: '5-minute pre-test rest', desc: 'Stay still, arm strapped at heart level, while fluid shifts settle. Breathe slowly with the glowing lungs.', art: 'lungs', anim: 'breath', calm: true, chimeAt: [60], runLabel: 'Resting', startSay: 'Starting five minute pre-test rest. Rest your arm at heart level and breathe slowly.', doneSay: 'Rest complete. Take your first blood pressure reading.' },
    { k: 'bp-gap', seconds: 60, title: '1-minute gap before the second reading', desc: 'Let the cuff deflate fully and wait while the arm refills, then take a second reading and enter the average.', art: 'stopwatch', chimeAt: [30], runLabel: 'Refilling', startSay: 'Starting one minute gap.', doneSay: 'Take your second reading now, then enter the average of the two.' }],
  spo2: [{ k: 'spo2', seconds: 20, title: '20-second signal stabilisation', desc: 'Keep the finger still in the clip until the timer ends, then read the steady value.', art: 'pulseox', runLabel: 'Stabilising', startSay: 'Hold still for twenty seconds.', doneSay: 'Signal stable. Read your oxygen level.' }],
  rr: [{ k: 'rr', seconds: 60, title: '60-second breath count', desc: 'Breathe naturally and tap once for each breath. Do not slow or deepen your breathing; that would change the result.', art: 'lungs', tap: 'breaths', chimeAt: [30], runLabel: 'Counting', startSay: 'Breathe naturally. Tap once for each breath.', doneSay: 'Time. Your breath count has been entered.' }],
  temp: [{ k: 'temp', seconds: 30, title: '30-second sensor dwell', desc: 'Hold the thermometer in place until the timer ends or the device beeps.', art: 'thermo', runLabel: 'Measuring', startSay: 'Hold the thermometer still for thirty seconds.', doneSay: 'Reading ready. Enter your temperature.' }],
  glu: [{ k: 'glu', seconds: 15, title: '15-second test strip countdown', desc: 'Start as the blood touches the strip. Most meters show the result when the countdown ends.', art: 'drop', runLabel: 'Analysing', startSay: 'Strip countdown started.', doneSay: 'Read your glucose result.' }]
};
const SAMN = ['Fully alert, wide awake', 'Very lively, responsive, but not at peak', 'Okay, somewhat fresh', 'A little tired, less than fresh', 'Moderately tired, let down', 'Extremely tired, very difficult to concentrate', 'Completely exhausted, unable to function effectively'];
const WB = [['stress', 'How stressed do you feel?', 'none', 'extreme'], ['isolation', 'How cut off from home and others do you feel?', 'not at all', 'very'], ['confinement', 'How much is living in a small space wearing on you?', 'not at all', 'a lot']];
export const SYMPTOMS = ['Headache', 'Blurred or changed vision', 'Nasal congestion', 'Back pain', 'Nausea or motion sickness', 'Sore throat or cough', 'Skin rash or irritation', 'Dizziness'];
const EX = { id: 'ex', name: 'Exercise', unit: 'min', dec: 0, step: 5, min: 0, max: 300 };
export const indOf = id => id === 'ex' ? EX : byId(id);
export const fieldsOf = id => id === 'bp' ? ['sys', 'dia'] : [id];
export const timerId = (D, k) => `ci-${D.day}-${k}`;
export const VOICE_STEPS = ['hr', 'bp', 'spo2', 'rr', 'temp', 'glu', 'sleep', 'ex'];

export function initDraft(P, A) {
  const last = P.log[P.log.length - 1], update = !!last && last.date === todayISO(), day = update ? last.d : (last ? last.d + 1 : 1);
  const v = {};
  for (const i of IND) v[i.id] = last && last.v[i.id] != null ? last.v[i.id] : +((i.g[0] + i.g[1]) / 2).toFixed(i.dec);
  v.ex = last && last.ex != null ? last.ex : 90;
  const lv = id => (A.find(a => a.ind.id === id) || { level: 0 }).level;
  const lvl = id => Math.max(...fieldsOf(id).map(lv));
  const gl = [...P.log].reverse().find(e => e.v.glu != null), gluDue = !gl || gl.d <= day - 7 || lv('glu') >= 1;
  const core = ['hr', 'bp', 'spo2', 'rr', 'temp'].concat(gluDue ? ['glu'] : []).map((id, k) => ({ id, k, l: lvl(id) })).sort((a, b) => b.l - a.l || a.k - b.k);
  const steps = core.map(x => x.id).concat(['sleep', 'fatigue', 'wellbeing', 'symptoms', 'ex', 'review']);
  const q = { stress: (last && last.q && last.q.stress) || 2, isolation: (last && last.q && last.q.isolation) || 2, confinement: (last && last.q && last.q.confinement) || 2 };
  return { steps, flagged: Object.fromEntries(core.map(x => [x.id, x.l]).concat([['sleep', lv('sleep')], ['fatigue', lv('fatigue')], ['wellbeing', lv('mood')]])), i: 0, v, q, sx: update && last.sx ? [...last.sx] : [], skip: {}, seen: {}, update, day, gluDue, heard: '' };
}

function verdict(id, val, A) {
  if (id === 'ex') { const pct = Math.round(val / 120 * 100); return { l: val >= 120 ? 0 : val >= 90 ? 1 : 2, t: `${pct}% of the 120-minute daily target` }; }
  const ind = byId(id), st = statusOf(ind, val), a = A.find(x => x.ind.id === id);
  const personal = a && !a.none && !a.provisional;
  let l = ST_LEVEL[st], t = ['In the normal range', 'In the caution range', 'In the alert range'][st];
  if (personal) {
    const d = val - a.bm, z = Math.abs(d) / a.bsd, th = Math.max(ind.step, a.bsd * 0.5);
    if (st === 1 && z < 1.5) { l = 0; t = 'Outside the population range, but normal for you'; }
    t += Math.abs(d) < th ? `, close to your usual ${fmt(a.bm, ind)}` : `, ${fmt(Math.abs(d), ind)} ${ind.unit} ${d > 0 ? 'above' : 'below'} your usual ${fmt(a.bm, ind)}`;
  }
  return { l, t };
}
function zones(ind) {
  const [lo, hi] = RANGE[ind.id], P = x => Math.max(0, Math.min(100, (x - lo) / (hi - lo) * 100));
  if (ind.id === 'ex') return `<span class="z2" style="width:${P(90)}%"></span><span class="z1" style="width:${P(120) - P(90)}%"></span><span class="z0" style="width:${100 - P(120)}%"></span>`;
  const cuts = [lo, ind.a[0], ind.g[0], ind.g[1], ind.a[1], hi].map(x => Math.max(lo, Math.min(hi, x)));
  return ['z2', 'z1', 'z0', 'z1', 'z2'].map((c, k) => `<span class="${c}" style="width:${P(cuts[k + 1]) - P(cuts[k])}%"></span>`).join('');
}
const pct = (id, x) => { const [lo, hi] = RANGE[id]; return Math.max(0, Math.min(100, (x - lo) / (hi - lo) * 100)); };

function reading(id, D, A, label) {
  const ind = indOf(id), val = D.v[id], a = A.find(x => x.ind.id === id), [lo, hi] = RANGE[id], vd = verdict(id, val, A);
  const marks = id === 'ex' ? [[120, 'target 120']] : a && !a.none && !a.provisional ? [[a.bm, 'your usual']] : [];
  return `<div>${label ? `<div class="lbl">${label}</div>` : ''}
  <div class="reading">
    <button class="pm" data-act="ci-step" data-id="${id}" data-dir="-1" aria-label="Lower ${esc(ind.name)} by ${ind.step}">−</button>
    <input class="bignum" id="val-${id}" data-ci="${id}" type="number" inputmode="decimal" step="${ind.step}" min="${ind.min}" max="${ind.max}" value="${val}" aria-label="${esc(ind.name)} in ${ind.unit}">
    <button class="pm" data-act="ci-step" data-id="${id}" data-dir="1" aria-label="Raise ${esc(ind.name)} by ${ind.step}">+</button>
    <span class="unit">${ind.unit}</span>
  </div>
  <div class="ruler"><div class="zones" aria-hidden="true">${zones(ind)}</div>
    ${marks.map(([x, t]) => `<span class="mk" style="left:${pct(id, x)}%">${t}</span>`).join('')}
    <span class="needle" id="needle-${id}" style="left:${pct(id, val)}%"></span>
    <input type="range" id="rng-${id}" data-ci="${id}" min="${lo}" max="${hi}" step="${ind.step}" value="${Math.max(lo, Math.min(hi, val))}" aria-label="Drag to set ${esc(ind.name)}">
    <div class="ends" aria-hidden="true"><span>${lo}</span><span>${hi}</span></div></div>
  <p class="verdict s${vd.l}" id="verdict-${id}" aria-live="polite">${glyph(vd.l, 18)}<span>${vd.t}</span></p></div>`;
}

function voiceBar(step, D) {
  if (!VOICE_STEPS.includes(step)) return '';
  const ex = { hr: 'seventy two', bp: 'one eighteen over seventy six', spo2: 'ninety eight', rr: 'fourteen', temp: 'thirty six point eight', glu: 'eighty eight', sleep: 'seven point five', ex: 'one twenty' }[step];
  if (!voice.canListen) return `<div class="voicebar small soft">Hands-free logging needs Chrome or Edge with microphone access. You can still type or drag.</div>`;
  return `<div class="voicebar"><button class="mic" data-act="ci-mic" aria-pressed="${voice.listening}" aria-label="Log this reading by voice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button><span>Hands-free: tap the mic and say the value, for example “${ex}”.</span>${D.heard ? `<span class="heard">Heard: ${esc(D.heard)}</span>` : ''}</div>`;
}

function stageBody(step, D, A, P) {
  if (step === 'review') {
    const ids = IND.filter(i => i.id !== 'mood' && (i.id !== 'glu' || D.gluDue)).map(i => i.id);
    const stepOf = id => id === 'sys' || id === 'dia' ? 'bp' : id;
    const rows = ids.map(id => {
      const ind = byId(id), sk = D.skip[stepOf(id)], v = D.v[id];
      return `<tr><td>${ind.name}</td><td class="num">${sk ? 'Not measured' : fmt(v, ind) + ' <span class="small soft">' + ind.unit + '</span>'}</td><td>${sk ? '' : chip(ST_LEVEL[statusOf(ind, v)]).replace('Nominal', 'Normal range').replace('Tell CMO', 'Caution range').replace('Contact ground', 'Alert range')}</td><td><button class="btn ghost" data-act="ci-go" data-i="${D.steps.indexOf(stepOf(id))}">Edit</button></td></tr>`;
    }).join('') + `<tr><td>Mood</td><td class="num">${D.v.mood}<span class="small soft"> /10</span></td><td></td><td><button class="btn ghost" data-act="ci-go" data-i="${D.steps.indexOf('wellbeing')}">Edit</button></td></tr>
      <tr><td>Symptoms</td><td>${D.sx.length ? esc(D.sx.join(', ')) : 'None'}</td><td></td><td><button class="btn ghost" data-act="ci-go" data-i="${D.steps.indexOf('symptoms')}">Edit</button></td></tr>
      <tr><td>Exercise</td><td class="num">${D.v.ex} <span class="small soft">min</span></td><td></td><td><button class="btn ghost" data-act="ci-go" data-i="${D.steps.indexOf('ex')}">Edit</button></td></tr>`;
    return `<div class="scroll"><table class="rev"><thead><tr><th>Reading</th><th>Value</th><th>Range check</th><th><span class="sr">Edit</span></th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="soft">Logging adds these readings to ${esc(P.name)}'s record as mission day ${D.day}, earns 100 XP, and updates your clearance, baseline comparison and forecasts.</p>`;
  }
  if (D.skip[step]) return `<p class="skipped">You marked this reading as not measured today. It will be left out of today's log.</p><div class="quick"><button data-act="ci-skip" data-id="${step}" aria-pressed="true">Measure it after all</button></div>`;
  if (step === 'fatigue') return `<div class="scale" role="group" aria-label="Samn-Perelli fatigue scale">${SAMN.map((t, k) => `<button data-act="ci-set" data-id="fatigue" data-val="${k + 1}" aria-pressed="${D.v.fatigue === k + 1}"><b>${k + 1}</b><span>${t}</span></button>`).join('')}</div><p class="small soft">Samn-Perelli 7-point fatigue scale, used in aviation and spaceflight fatigue research.</p>`;
  if (step === 'wellbeing') {
    const worry = D.v.mood <= 3 || D.q.stress >= 5 || D.q.isolation >= 5;
    return `<div><div class="lbl">Overall mood</div><div class="moods" role="group" aria-label="Mood from 1 to 10">${Array.from({ length: 10 }, (_, k) => k + 1).map(n => `<button data-act="ci-set" data-id="mood" data-val="${n}" aria-pressed="${Math.round(D.v.mood) === n}">${n}</button>`).join('')}</div></div>
    <div class="likert">${WB.map(([k, q, lo, hi]) => `<div class="row"><span>${q}<br><span class="small soft">1 ${lo}, 5 ${hi}</span></span><div class="opts" role="group" aria-label="${q}">${[1, 2, 3, 4, 5].map(n => `<button data-act="ci-q" data-id="${k}" data-val="${n}" aria-pressed="${D.q[k] === n}">${n}</button>`).join('')}</div></div>`).join('')}</div>
    ${worry ? '<p class="note">That sounds like a hard day. Consider a private conference with the behavioural health team, or talk to a crewmate you trust today.</p>' : ''}
    <p class="small soft">A brief check written for this app, not a validated or diagnostic questionnaire. Answers stay on this device unless you share the report.</p>`;
  }
  if (step === 'symptoms') return `<div class="symptoms" role="group" aria-label="Symptoms">${SYMPTOMS.map(s => `<button data-act="ci-sx" data-val="${esc(s)}" aria-pressed="${D.sx.includes(s)}">${s}</button>`).join('')}</div>
    <div class="quick"><button data-act="ci-sx-none" aria-pressed="${!D.sx.length}">None of these</button></div>
    ${D.sx.includes('Headache') ? '<p class="note info">Headaches in flight are often linked to raised cabin carbon dioxide. Check the cabin telemetry in Systems.</p>' : ''}${D.sx.includes('Blurred or changed vision') ? '<p class="note">Vision changes can be an early sign of spaceflight-associated neuro-ocular syndrome. Tell the crew medical officer and run the weekly vision test.</p>' : ''}`;
  let body;
  if (step === 'bp') body = `<div class="bp">${reading('sys', D, A, 'Systolic, the upper number')}${reading('dia', D, A, 'Diastolic, the lower number')}</div>`;
  else body = reading(step, D, A);
  const lastE = P.log[P.log.length - 1];
  const lastVal = lastE ? (step === 'ex' ? lastE.ex : step === 'bp' ? (lastE.v.sys != null ? lastE.v.sys + '/' + lastE.v.dia : null) : lastE.v[step]) : null;
  const quick = `<div class="quick">${lastVal != null && !D.update ? `<button data-act="ci-same" data-id="${step}">Same as last time (${lastVal})</button>` : ''}${step !== 'ex' ? `<button data-act="ci-skip" data-id="${step}" aria-pressed="false">I can't measure this today</button>` : ''}</div>`;
  const timers = (TIMERS[step] || []).map(t => timerHTML(timerId(D, t.k), t)).join('');
  const ind = step === 'bp' ? byId('sys') : indOf(step);
  const tut = ind.tut ? tutorial(ind) : '';
  const extra = step === 'ex' ? `<div class="howto"><div><b>How to count it</b>Add up treadmill, cycle and resistance sessions. Warm-up counts; rest between sets does not.</div><div><b>Why it matters in space</b>Without gravity, weight-bearing bones lose 1% to 1.5% of their density a month. Daily exercise is the main countermeasure. Hitting 120 minutes earns 50 XP.</div></div>`
    : step === 'sleep' ? `<div class="howto"><div><b>How to count it</b>${ind.how}</div><div><b>Why it matters in space</b>${ind.space}</div></div>` : `<div class="howto"><div><b>Why it matters in space</b>${ind.space}</div></div>`;
  return tut + timers + body + voiceBar(step, D) + quick + extra;
}

const SHORT = { hr: 'Heart rate', bp: 'Blood pressure', spo2: 'SpO₂', rr: 'Breathing', temp: 'Temperature', glu: 'Blood sugar', sleep: 'Sleep' };
const VITAL = Object.keys(SHORT);
// Daily flight clearance checklist: each vital turns green once it is logged.
export function vitalsHTML(D) {
  const vit = D.steps.filter(s => VITAL.includes(s)), cur = D.steps[D.i];
  const ok = s => !D.skip[s] && (D.seen[s] || (D.touched && D.touched[s]));
  const n = vit.filter(ok).length, pctv = Math.round(n / vit.length * 100);
  return `<div class="vitals" id="vitals"><div class="vhead"><b>Daily flight clearance: ${n} of ${vit.length} vitals logged</b><span class="num">${pctv}%</span></div>
    <div class="vbar" role="progressbar" aria-label="Vitals logged" aria-valuemin="0" aria-valuemax="${vit.length}" aria-valuenow="${n}"><i style="width:${pctv}%"></i></div>
    <ul class="vlist">${vit.map(s => `<li><button data-act="ci-go" data-i="${D.steps.indexOf(s)}" class="${ok(s) ? 'ok' : D.skip[s] ? 'skip' : ''}${s === cur ? ' cur' : ''}" ${s === cur ? 'aria-current="step"' : ''}><span class="vk" aria-hidden="true">${ok(s) ? '✓' : D.skip[s] ? '–' : ''}</span>${SHORT[s]}<span class="sr">${ok(s) ? ', logged' : D.skip[s] ? ', not measured' : ', to do'}</span></button></li>`).join('')}</ul></div>`;
}
export function refreshVitals(D) { const el = document.getElementById('vitals'); if (el) el.outerHTML = vitalsHTML(D); }

export function view(ctx) {
  const { P, A, m, S } = ctx, D = S.ci, step = D.steps[D.i], next = D.steps[D.i + 1], done = D.steps.filter(s => D.seen[s]).length;
  const first = D.steps.filter(s => D.flagged[s] >= 1 && ['hr', 'bp', 'spo2', 'rr', 'temp', 'glu'].includes(s));
  const band = `<section class="band"><div class="wrap"><div class="frame">
    <div class="kicker">PRE-FLIGHT HEALTH CLEARANCE · MISSION DAY ${String(D.day).padStart(3, '0')}</div>
    <h1>${D.update ? `Update today's clearance` : `Day ${D.day} clearance mission`}</h1>
    <p class="lede">${esc(P.name)}, ${D.steps.length - 1} checks stand between you and today's duty clearance, about ${D.steps.includes('bp') ? 'ten' : 'five'} minutes with the timed rests. ${first.length ? `${NAME[first[0]]} comes first today because it has been drifting.` : 'Your readings have been steady, so they come in the usual order.'}</p>
    <div class="facts"><span>Location<b>${m.name}</b></span><span>One-way signal<b>${m.oneWayS < 60 ? m.oneWayS.toFixed(1) + ' s' : (m.oneWayS / 60).toFixed(0) + ' min'}</b></span><span>Ground consult, 3 exchanges<b>${(consultDays(m) * 24).toFixed(0)} h</b></span><span>Reward<b>+100 XP</b></span></div>
    ${vitalsHTML(D)}
    ${P.briefed ? '' : '<p class="newhere"><button class="btn onband" data-act="br-open">New here? 3-step mission briefing</button></p>'}
  </div></div></section>`;
  const nav = `<nav class="panel stepsnav" aria-label="Clearance steps"><ol>${D.steps.map((s, k) => `<li><button data-act="ci-go" data-i="${k}" class="${D.seen[s] && k !== D.i ? 'done' : ''}" ${k === D.i ? 'aria-current="step"' : ''}><span class="n">${D.seen[s] && k !== D.i ? '✓' : k + 1}</span><span>${NAME[s]}</span>${D.flagged[s] >= 1 ? `<span class="s${D.flagged[s]}" title="Drifting">${glyph(D.flagged[s], 14)}</span>` : '<span></span>'}</button></li>`).join('')}</ol>
    <p class="small soft" style="margin-top:14px;padding:0 10px">${done} of ${D.steps.length} done. Drifting readings are asked first.${D.gluDue ? '' : ' Blood sugar is weekly and not due today.'}</p></nav>`;
  const flag = D.flagged[step] >= 1 ? `<p class="why-first s${D.flagged[step]}">${glyph(D.flagged[step], 16)}This has been drifting from your baseline, so it comes first.</p>` : '';
  const stage = `<section class="panel br stage" aria-labelledby="q">${flag}<h2 class="q" id="q" tabindex="-1">${Q[step]}</h2>${stageBody(step, D, A, P)}
    <div class="stagebar"><button class="btn" data-act="ci-back" ${D.i === 0 ? 'disabled' : ''}>Back</button>
    ${step === 'review' ? `<button class="btn go big" data-act="ci-save">${D.update ? `Update day ${D.day} clearance` : `Log day ${D.day} and request clearance`}</button>` : `<button class="btn primary big" data-act="ci-next">Next: ${NAME[next]}</button>`}</div></section>`;
  return band + `<div class="wrap page"><div class="grid ci">${nav}${stage}</div></div>`;
}

// Update one reading in place while dragging or typing, without re-rendering the page.
export function live(id, D, A) {
  const val = D.v[id], n = document.getElementById('needle-' + id), r = document.getElementById('rng-' + id), inp = document.getElementById('val-' + id), vd = document.getElementById('verdict-' + id);
  if (n) n.style.left = pct(id, val) + '%';
  if (r && document.activeElement !== r) r.value = val;
  if (inp && document.activeElement !== inp) inp.value = val;
  if (vd) { const x = verdict(id, val, A); vd.className = 'verdict s' + x.l; vd.innerHTML = glyph(x.l, 18) + '<span>' + x.t + '</span>'; }
}
