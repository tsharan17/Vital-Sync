// Vital Sync engine. Pure functions, no DOM.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
// Compliance motivation: XP, ranks, mission readiness, daily clearance quest and achievements.
import { ADAPT } from './indicators.js';
import { sleepDebt } from './modules.js';
import { PVT_ACE_MS } from './cognitive.js';

export const XP = { checkin: 100, exercise: 50, cognitive: 75 };
export const RANKS = [
  { name: 'Flight Cadet', xp: 0 }, { name: 'Specialist', xp: 1500 },
  { name: 'Science Officer', xp: 5000 }, { name: 'Mission Commander', xp: 10000 }
];
const week = d => Math.floor((d - 1) / 7);

export function xpOf(P) {
  const log = P.log || [], cog = P.cog || [];
  const checkins = log.length, exercise = log.filter(e => (e.ex || 0) >= 120).length;
  const cogWeeks = new Set(cog.map(c => week(c.d))).size;
  return { total: checkins * XP.checkin + exercise * XP.exercise + cogWeeks * XP.cognitive, checkins, exercise, cogWeeks };
}
export function rankOf(xp) {
  let i = 0; for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k;
  const next = RANKS[i + 1];
  return { ...RANKS[i], index: i, next: next || null, progress: next ? (xp - RANKS[i].xp) / (next.xp - RANKS[i].xp) : 1 };
}
export function streakOf(log, day) {
  const days = new Set(log.map(e => e.d)); let n = 0; for (let d = day; days.has(d); d--) n++; return n;
}
// Mission readiness (0 to 100): cardiovascular state, sleep reserve and cognitive sharpness.
export function missionReadiness(A, log, day, cog) {
  const lv = id => (A.find(a => a.ind.id === id) || { level: 0 }).level;
  const cardio = 100 - Math.max(lv('hr'), lv('sys'), lv('dia'), lv('spo2'), lv('rr')) * 25;
  const sleep = Math.max(0, 100 - sleepDebt(log, day).debt * 8);
  const last = (cog || []).filter(c => c.d <= day).slice(-1)[0];
  const cogn = last ? last.score : 75;
  const score = Math.round(0.4 * cardio + 0.35 * sleep + 0.25 * cogn);
  return { score, cardio: Math.round(cardio), sleep: Math.round(sleep), cognitive: cogn, cogMeasured: !!last };
}
export function clearance(topLevel) {
  return [
    { code: 'go', title: 'Cleared for duty' }, { code: 'go', title: 'Cleared for duty, watch item noted' },
    { code: 'restrict', title: 'Cleared with restrictions' }, { code: 'nogo', title: 'Not cleared: medical review needed' }
  ][topLevel];
}
export const BADGES = [
  { id: 'immune', icon: '🛡️', name: 'Immune Fortress', how: '7 nights in a row with no sleep debt (7 hours or more)' },
  { id: 'neuro', icon: '⚡', name: 'Neuro-Ace', how: `Median reaction time under ${PVT_ACE_MS} ms on the attention test` },
  { id: 'survivor', icon: '🚀', name: 'Deep Space Veteran', how: '30-day check-in streak' },
  { id: 'adapted', icon: '🧬', name: 'Zero-G Adapted', how: `Completed the ${ADAPT}-day adaptation window` }
];
export function achievements(P, day) {
  const log = (P.log || []).filter(e => e.d <= day), cog = P.cog || [];
  let run = 0, best = 0;
  for (const e of log) { if (e.v && e.v.sleep != null && e.v.sleep >= 7) { run++; best = Math.max(best, run); } else run = 0; }
  let s = 0, bs = 0, prev = null;
  for (const e of log) { s = prev != null && e.d === prev + 1 ? s + 1 : 1; bs = Math.max(bs, s); prev = e.d; }
  const got = {
    immune: best >= 7,
    neuro: cog.some(c => c.pvt && c.pvt.median != null && c.pvt.median < PVT_ACE_MS),
    survivor: bs >= 30,
    adapted: log.some(e => e.d > ADAPT)
  };
  return BADGES.map(b => ({ ...b, unlocked: !!got[b.id] }));
}
// Daily clearance quest: the tasks that make up today's mission.
export function quests(P, day, todayDone) {
  const e = (P.log || []).find(x => x.d === day), cog = P.cog || [], extra = P.extra || [];
  const cogDue = !cog.some(c => c.d > day - 7);
  return [
    { id: 'checkin', name: 'Pre-flight health check-in', xp: XP.checkin, done: !!todayDone },
    { id: 'exercise', name: 'Exercise target of 120 minutes', xp: XP.exercise, done: !!e && (e.ex || 0) >= 120 },
    { id: 'cognitive', name: 'Weekly cognitive battery', xp: XP.cognitive, done: !cogDue, weekly: true },
    { id: 'weekly', name: 'Weekly protocol tasks', xp: 0, done: ['acuity', 'strength', 'balance'].every(t => extra.some(x => x.type === t && x.d > day - 7)), weekly: true }
  ];
}
