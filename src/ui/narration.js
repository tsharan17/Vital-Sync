// Narration scripts for the audio player: technique guides for every check-in step, the guided session,
// the flight surgeon debrief and the ground report.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { byId, debrief, missionReadiness, xpOf, rankOf } from '../engine/index.js';
import { stepsFor, rank } from './format.js';

const NAME = { bp: 'Blood pressure', hr: 'Heart rate', spo2: 'Blood oxygen', rr: 'Breathing rate', temp: 'Temperature', glu: 'Blood sugar', sleep: 'Sleep', fatigue: 'Fatigue', wellbeing: 'Wellbeing and mood', symptoms: 'Symptoms', ex: 'Exercise' };
const EXTRA = {
  sleep: ['Count only the time you were actually asleep, not the time you spent in your sleeping bag awake.', 'Enter it in hours. You can say it, for example: seven point five.', 'Seven hours or more counts toward your Immune Fortress badge.'],
  fatigue: ['Read the seven statements and pick the one that matches how alert you feel right now.', 'One is fully alert. Seven is completely exhausted.', 'Answer for this moment, not for the whole day.'],
  wellbeing: ['Choose your overall mood from one to ten. You can say it, for example: mood seven.', 'Once a week there are seven short questions from two published scales, about stress and loneliness. Answer for the last week.', 'Your answers stay on this device unless you share the report.'],
  symptoms: ['Tap any symptom you have today, or choose none of these.', 'Headaches can come from raised cabin carbon dioxide. Vision changes should be reported to your crew medical officer.'],
  ex: ['Add up all your exercise today: treadmill, cycle and resistance.', 'Warm-up counts. Rest between sets does not.', 'One hundred and twenty minutes meets the daily target and earns fifty experience points.']
};
const plain = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

export function guideLines(step) {
  const id = step === 'bp' || step === 'dia' ? 'sys' : step === 'mood' ? 'wellbeing' : step;
  const ind = ['sleep', 'fatigue', 'wellbeing', 'symptoms', 'ex'].includes(id) ? null : byId(id);
  const nm = NAME[step === 'sys' || step === 'dia' ? 'bp' : step] || NAME[id] || (ind && ind.name) || 'Guide';
  const steps = ind && ind.tut ? ind.tut : EXTRA[id] || [];
  return [{ text: `${nm} guide.`, head: true }, ...steps.map((t, k) => ({ text: `Step ${k + 1}. ${t}`, pause: 500 }))];
}
export function guideTitle(step) { return `${NAME[step === 'sys' || step === 'dia' ? 'bp' : step === 'mood' ? 'wellbeing' : step] || 'Technique'} guide`; }

// Guided session: four slow paced breaths to settle, then each measurement's technique.
export function sessionLines() {
  const L = [
    { text: 'Welcome to your guided health session. Find a comfortable position, anchored and still.', head: true },
    'We will settle your breathing first, then walk through each measurement.',
    { text: 'Breathe in slowly for four counts.', pause: 2600, phase: 'in' }, { text: 'And out for four.', pause: 2600, phase: 'out' },
    { text: 'In for four.', pause: 3000, phase: 'in' }, { text: 'And out.', pause: 3000, phase: 'out' },
    { text: 'Once more, in.', pause: 3000, phase: 'in' }, { text: 'And out.', pause: 3000, phase: 'out' },
    { text: 'Last breath in.', pause: 3000, phase: 'in' }, { text: 'And out. Now breathe normally.', pause: 1200, phase: 'out' }
  ];
  for (const id of ['sys', 'hr', 'spo2', 'rr', 'temp']) {
    const ind = byId(id);
    L.push({ text: `${id === 'sys' ? 'Blood pressure' : NAME[id]}.`, pause: 300, head: true });
    ind.tut.forEach(t => L.push({ text: t, pause: 500 }));
  }
  L.push('That is the full protocol. Log each reading as you take it. Well done.');
  return L;
}

// Flight surgeon debrief: today's assessment, vitals, drift, then the action plan for the most urgent reading.
export function debriefLines(ctx) {
  const { P, A, day } = ctx, rk = rankOf(xpOf(P).total), rd = missionReadiness(A, P.log, day, P.cog);
  const L = debrief({ rankName: rk.name, hour: new Date().getHours(), A, readiness: P.log.length ? rd : null, day: P.log.length ? day : null });
  const top = rank(A.filter(a => !a.none))[0];
  if (top && top.level >= 1) {
    const st = (stepsFor(top) || []).map(plain).filter(Boolean).slice(0, 3);
    if (st.length) { L.splice(L.length - 1, 0, `Action plan for ${top.ind.name.toLowerCase()}.`); st.forEach(x => L.splice(L.length - 1, 0, x.endsWith('.') ? x : x + '.')); }
  }
  return L.map((t, k) => ({ text: t, head: k === 0, pause: 250 }));
}

// Ground report: read the transmission packet line by line, skipping formatting.
export function reportLines(text) {
  return String(text).split('\n').map(l => l.replace(/^[-#*\s]+/, '').replace(/[|_]/g, ' ').trim()).filter(l => l && !/^=+$/.test(l))
    .map(l => l.replace(/\bbpm\b/g, 'beats per minute').replace(/\bmmHg\b/g, 'millimetres of mercury').replace(/\bSpO2\b/g, 'blood oxygen').replace(/\bCMO\b/g, 'crew medical officer'));
}
