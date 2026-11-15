// Audio hub: spoken daily debrief, a guided session, spoken technique guides, hands-free logging practice,
// and the sound and voice settings.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { byId, debrief, missionReadiness, xpOf, rankOf } from '../../engine/index.js';
import { esc } from '../format.js';
import { voice, parseSpoken, wordsToNumbers } from '../audioGuide.js';
import { getVolume, isMuted } from '../soundFx.js';
import { GUIDES, guideSrc } from '../tutorials.js';

export const GUIDE_IDS = ['sys', 'spo2', 'hr', 'glu', 'temp', 'rr'];
const GUIDE_NAME = { sys: 'Blood pressure', spo2: 'Blood oxygen', hr: 'Heart rate', glu: 'Blood sugar', temp: 'Temperature', rr: 'Breathing rate' };
export const H = { playing: null, line: -1, tried: '', triedOk: null };

export function debriefLines(ctx) {
  const { P, A, day } = ctx, rk = rankOf(xpOf(P).total), rd = missionReadiness(A, P.log, day, P.cog);
  return debrief({ rankName: rk.name, hour: new Date().getHours(), A, readiness: P.log.length ? rd : null, day: P.log.length ? day : null });
}
export function guideLines(id) {
  const ind = byId(id);
  return [`${GUIDE_NAME[id]} technique guide.`, ...ind.tut.map((t, k) => ({ text: `Step ${k + 1}. ${t}`, pause: 600 }))];
}
// The guided session: settle, pace four slow breaths, then walk through each measurement.
export function sessionLines() {
  const L = [
    'Welcome to your guided health session. Find a comfortable position, anchored and still.',
    'We will settle your breathing first, then walk through each measurement.',
    { text: 'Breathe in slowly for four counts.', pause: 2600, phase: 'breath' }, { text: 'And out for four.', pause: 2600, phase: 'breath' },
    { text: 'In for four.', pause: 3000, phase: 'breath' }, { text: 'And out.', pause: 3000, phase: 'breath' },
    { text: 'Once more, in.', pause: 3000, phase: 'breath' }, { text: 'And out. Now breathe normally.', pause: 1000, phase: 'breath' }
  ];
  for (const id of ['sys', 'hr', 'spo2', 'rr', 'temp']) {
    const ind = byId(id);
    L.push({ text: `${GUIDE_NAME[id]}.`, pause: 300, head: true });
    ind.tut.forEach(t => L.push({ text: t, pause: 500 }));
  }
  L.push('That is the full protocol. Open the clearance when you are ready, and log your readings. Well done.');
  return L;
}
const textOf = l => typeof l === 'object' ? l.text : l;

const lineList = (key, lines) => `<ol class="script" data-q="${key}">${lines.map((l, k) => `<li class="${H.playing === key && H.line === k ? 'now' : ''}${typeof l === 'object' && l.head ? ' head' : ''}">${esc(textOf(l))}</li>`).join('')}</ol>`;
const playBtn = (key, label, extra = '') => H.playing === key
  ? `<button class="btn" data-act="au-stop">■ Stop</button>`
  : `<button class="btn primary" data-act="${key === 'debrief' ? 'au-debrief' : key === 'session' ? 'au-session' : 'au-guide'}" ${extra}>▶ ${label}</button>`;

export function view(ctx) {
  const { P } = ctx, deb = debriefLines(ctx), ses = sessionLines(), set = voice.settings, vs = voice.voices();
  const noSpeech = voice.canSpeak ? '' : '<p class="note">This browser has no speech output, so spoken guides are shown as text only.</p>';
  const band = `<section class="band"><div class="wrap"><div class="frame">
    <div class="kicker">AUDIO COACH</div><h1>Audio hub</h1>
    <p class="lede">A calm voice for the parts of the day when your hands are busy: today's debrief, a guided session through the protocol, every technique guide read aloud, and hands-free logging.</p>
    <div class="facts"><span>Voice coach<b>${voice.on ? 'On' : 'Off'}</b></span><span>Sound effects<b>${isMuted() ? 'Muted' : Math.round(getVolume() * 100) + '%'}</b></span><span>Voice logging<b>${voice.canListen ? 'Available' : 'Not in this browser'}</b></span></div>
  </div></div></section>`;

  const debriefP = `<section class="panel br" id="au-debrief"><div class="lbl">Spoken daily debrief</div><h2 style="margin-bottom:6px">Today's results, in plain words</h2>
    <p class="soft" style="margin-bottom:14px">Written from ${esc(P.name)}'s latest assessment and read in the style of a flight surgeon's morning call.</p>
    ${noSpeech}${lineList('debrief', deb)}<p style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">${playBtn('debrief', 'Play debrief')}</p></section>`;

  const sessionP = `<section class="panel" id="au-session"><div class="lbl">Guided session</div><h2 style="margin-bottom:6px">Talk me through it</h2>
    <p class="soft" style="margin-bottom:14px">About four minutes. Four slow paced breaths to settle, then the technique for each measurement. Breathe normally again before you count your breathing rate.</p>
    <div class="pacer ${H.playing === 'session' ? 'on' : ''}" id="pacer" aria-hidden="true"><i></i><span id="pacer-t">Paced breathing</span></div>
    <details class="scriptbox"${H.playing === 'session' ? ' open' : ''}><summary>Show the script</summary>${lineList('session', ses)}</details>
    <p style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">${playBtn('session', 'Start guided session')}<button class="btn" data-act="au-handsfree">Hands-free clearance</button></p></section>`;

  const guides = `<section><h2 style="margin:6px 0 14px">Technique guides, read aloud</h2><div class="grid three">${GUIDE_IDS.map(id => {
    const ind = byId(id), key = 'g-' + id;
    return `<article class="panel guidecard"><img src="${guideSrc(ind.tool)}" alt="" loading="lazy" width="720" height="460"><h3 style="margin:12px 0 4px">${GUIDE_NAME[id]}</h3><p class="small soft" style="margin-bottom:12px">${ind.tut.length} steps · ${GUIDES[ind.tool].title}</p>
      ${H.playing === key ? lineList(key, guideLines(id)) : ''}<p>${H.playing === key ? '<button class="btn" data-act="au-stop">■ Stop</button>' : `<button class="btn" data-act="au-guide" data-id="${id}">▶ Play guide</button>`}</p></article>`;
  }).join('')}</div></section>`;

  const tryP = `<section class="panel" id="au-try"><div class="lbl">Hands-free logging practice</div><h2 style="margin-bottom:6px">Say a reading the way you would say it</h2>
    <p class="soft" style="margin-bottom:14px">During the clearance, tap the microphone on any reading and speak. Try it here first; nothing is logged.</p>
    <ul class="plain phrases">${[['One twenty over eighty', 'Blood pressure 120/80'], ['Pulse sixty-eight', 'Heart rate 68'], ['SpO2 ninety-eight percent', 'Blood oxygen 98%'], ['Thirty six point eight', 'Temperature 36.8 °C'], ['Fourteen breaths', 'Breathing rate 14']].map(([a, b]) => `<li><span>“${a}”</span><b>${b}</b></li>`).join('')}</ul>
    ${voice.canListen ? `<div class="voicebar" style="margin-top:14px"><button class="mic" data-act="au-try" aria-pressed="false" aria-label="Try voice logging"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button><span id="au-heard">${H.tried ? `Heard “${esc(H.tried)}” → <b>${H.triedOk ? esc(H.triedOk) : 'no number found'}</b>` : 'Tap the mic and say a reading.'}</span></div>` : '<p class="note" style="margin-top:14px">Voice logging needs Chrome or Edge with microphone access and a network connection. Typing and dragging always work.</p>'}
  </section>`;

  const setP = `<section class="panel" id="au-set"><div class="lbl">Sound and voice</div><h2 style="margin-bottom:14px">Settings</h2>
    <div class="setgrid">
      <label for="vol">Master volume <output id="volo">${Math.round(getVolume() * 100)}%</output></label><input type="range" id="vol" min="0" max="100" step="5" value="${Math.round(getVolume() * 100)}">
      <label for="vrate">Speaking speed <output id="vrateo">${set.rate.toFixed(2)}×</output></label><input type="range" id="vrate" min="0.7" max="1.3" step="0.05" value="${set.rate}">
      ${vs.length ? `<label for="vname">Voice</label><select id="vname" class="field">${vs.map(v => `<option value="${esc(v.name)}" ${voice.pick() && voice.pick().name === v.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select>` : ''}
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><button class="tog" data-act="snd" aria-pressed="${!isMuted()}">${isMuted() ? 'Sound effects muted' : 'Sound effects on'}</button><button class="tog" data-act="vc" aria-pressed="${voice.on}">${voice.on ? 'Voice coach on' : 'Voice coach off'}</button><button class="btn" data-act="au-vtest" style="min-height:40px;padding:8px 14px">Test voice</button></div>
    <div class="lbl" style="margin-top:20px">Sound check</div><div class="quick">${[['blip', 'Interface blip'], ['tick', 'Countdown beep'], ['chime', 'Midpoint chime'], ['bell', 'Timer bell'], ['fanfare', 'Clearance fanfare'], ['klaxon', 'Alert klaxon']].map(([k, t]) => `<button data-act="au-sfx" data-s="${k}">${t}</button>`).join('')}</div>
    <p class="small soft" style="margin-top:12px">All sounds are generated in the browser; there are no audio files. Voice uses your device's built-in speech.</p></section>`;

  return band + `<div class="wrap page"><div class="grid" style="gap:22px">${debriefP}<div class="grid two">${sessionP}${tryP}</div>${guides}${setP}</div></div>`;
}

// Highlight the line being spoken without re-rendering the page.
export function mark(key, i) {
  H.line = i;
  const ol = document.querySelector(`[data-q="${key}"]`); if (!ol) return;
  [...ol.children].forEach((li, k) => li.classList.toggle('now', k === i));
  const li = ol.children[i]; if (li && ol.closest('details')) ol.closest('details').open = true;
}
export function pacer(on, label) {
  const p = document.getElementById('pacer'); if (!p) return;
  p.classList.toggle('breathing', !!on); const t = document.getElementById('pacer-t'); if (t && label) t.textContent = label;
}
export const _num = wordsToNumbers; export const _parse = parseSpoken;
