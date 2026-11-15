// Engine tests. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IND, MODES, byId, statusOf, consultDays, analyze, sleepDebt, simulate, evaluate } from '../src/engine/index.js';

const mars = MODES.find(m => m.id === 'mars');
const leo = MODES.find(m => m.id === 'leo');

test('status uses normal, caution and alert ranges', () => {
  const hr = byId('hr');
  assert.equal(statusOf(hr, 60), 0);
  assert.equal(statusOf(hr, 110), 1);
  assert.equal(statusOf(hr, 130), 2);
});

test('three exchanges from Mars take about 38 hours', () => {
  assert.ok(Math.abs(consultDays(mars) * 24 - 38) < 0.5);
  assert.ok(consultDays(leo) * 24 < 3.1);
});

test('simulator is deterministic for a given seed', () => {
  assert.deepEqual(simulate('cardio', 60, 7), simulate('cardio', 60, 7));
  assert.notDeepEqual(simulate('cardio', 60, 7), simulate('cardio', 60, 8));
});

test('baseline is provisional during the adaptation window', () => {
  const log = simulate('healthy', 20, 3);
  assert.equal(analyze(log, byId('hr'), 20, mars, false).provisional, true);
});

test('drift detector flags the silent blood pressure climb before the fixed threshold', () => {
  for (const seed of [7, 11, 23, 42]) {
    const ev = evaluate(simulate('cardio', 150, seed), 'cardio');
    const row = ev.rows.find(r => r.mode.id === 'mars' && r.ind.id === 'sys');
    assert.ok(row.watch != null, `seed ${seed}: not detected`);
    assert.ok(row.amber == null || row.watch < row.amber, `seed ${seed}: threshold fired first`);
  }
});

test('false alarm rate on healthy missions stays under 2%', () => {
  let fa = 0, tot = 0;
  for (const seed of [1, 2, 3, 7, 11, 23, 42]) { const ev = evaluate(simulate('healthy', 150, seed), 'healthy'); fa += ev.fa; tot += ev.tot; }
  assert.ok(fa / tot < 0.02, `false alarm rate ${(fa / tot * 100).toFixed(2)}%`);
});

test('Mars distance escalates no later than Earth orbit for the same data', () => {
  const log = simulate('cardio', 150, 23);
  for (let d = 80; d <= 120; d++) {
    const a = analyze(log, byId('sys'), d, leo, false), b = analyze(log, byId('sys'), d, mars, false);
    assert.ok(b.level >= a.level, `day ${d}`);
  }
});

test('sleep debt counts hours below seven', () => {
  const log = [{d: 1, v: {sleep: 6}}, {d: 2, v: {sleep: 5.5}}, {d: 3, v: {sleep: 8}}];
  assert.equal(sleepDebt(log, 3).debt, 2.5);
});

test('every indicator has guidance and a source', () => {
  for (const i of IND) { assert.ok(i.why && i.how && i.space && i.self.length && i.cmo.length && i.now.length && i.src[1].startsWith('https://')); }
});

// ---- Upgrade tests: SpO2, personal baselines, cognitive scoring, cabin telemetry, gamification ----
import { pvtStats, memoryScore, trackingScore, cognitiveScore, envStatus, xpOf, rankOf, achievements, missionReadiness, analyzeAll } from '../src/engine/index.js';

test('SpO2 ranges: 95 to 100 nominal, 90 to 94 caution, below 90 alert', () => {
  const s = byId('spo2');
  assert.equal(s.region, 'chest');
  assert.equal(statusOf(s, 98), 0);
  assert.equal(statusOf(s, 92), 1);
  assert.equal(statusOf(s, 87), 2);
});

const steady = (n, sys, dia, from = 1) => Array.from({ length: n }, (_, k) => ({ d: from + k, v: { sys: sys + ((k * 7) % 5) - 2, dia: dia + ((k * 3) % 3) - 1 } }));
const pre = { sys: { m: 90, s: 4 }, dia: { m: 60, s: 3 } };

test('personal baseline: a 90/60 astronaut is nominal', () => {
  const log = steady(40, 90, 60);
  assert.equal(analyze(log, byId('sys'), 40, mars, false, pre).level, 0);
  assert.equal(analyze(log, byId('dia'), 40, mars, false, pre).level, 0);
});

test('personal baseline: a shift from 90/60 to 115/80 is flagged as drift', () => {
  const log = steady(40, 90, 60).concat(steady(8, 115, 80, 41));
  const a = analyze(log, byId('sys'), 48, mars, false, pre);
  assert.equal(statusOf(byId('sys'), 115), 0, '115 is inside the textbook range');
  assert.ok(a.level >= 1, `level ${a.level}`);
});

test('personal baseline: a value normal for the astronaut is not flagged, but alert limits always apply', () => {
  const low = Array.from({ length: 40 }, (_, k) => ({ d: k + 1, v: { hr: 47 + (k % 3) - 1 } }));
  const hrPre = { hr: { m: 47, s: 2 } };
  assert.equal(statusOf(byId('hr'), 47), 1, 'textbook says caution');
  assert.equal(analyze(low, byId('hr'), 40, mars, false, hrPre).level, 0);
  const crash = low.concat([{ d: 41, v: { hr: 35 } }]);
  assert.equal(analyze(crash, byId('hr'), 41, mars, false, hrPre).level, 3);
});

test('uncalibrated profiles keep textbook ranges', () => {
  const log = [{ d: 1, v: { dia: 55 } }, { d: 2, v: { dia: 55 } }];
  assert.equal(analyze(log, byId('dia'), 2, mars, false).level, 2);
});

test('healthy missions rarely show any personal-baseline flag', () => {
  let flagged = 0, tot = 0;
  for (const seed of [1, 2, 3, 7, 11]) {
    const log = simulate('healthy', 150, seed);
    for (let d = 40; d <= 150; d += 2) for (const a of analyzeAll(log, d, mars, false)) { tot++; if (a.level >= 1) flagged++; }
  }
  assert.ok(flagged / tot < 0.03, `${(flagged / tot * 100).toFixed(2)}% of reading-days flagged`);
});

test('cognitive scoring', () => {
  const fast = pvtStats([210, 225, 230, 218, 240, 205, 215]);
  assert.equal(fast.median, 218); assert.equal(fast.lapses, 0); assert.equal(fast.fatigued, false); assert.ok(fast.score >= 95);
  const tired = pvtStats([350, 380, 520, 610, 340, 400, 360], 2);
  assert.equal(tired.lapses, 2); assert.equal(tired.fatigued, true); assert.ok(tired.score < fast.score);
  assert.equal(memoryScore(9), 100); assert.equal(memoryScore(2), 0);
  assert.equal(trackingScore(0.8), 80);
  assert.equal(cognitiveScore({ pvt: 100, memory: 50, tracking: 50 }), 70);
  assert.equal(cognitiveScore({ pvt: 90 }), 90);
});

test('cabin sensor thresholds', () => {
  assert.equal(envStatus('co2', 2.5), 0);
  assert.equal(envStatus('co2', 4.2), 1);
  assert.equal(envStatus('co2', 5.3), 2);
  assert.equal(envStatus('o2', 20.9), 0);
  assert.equal(envStatus('o2', 19.6), 1);
  assert.equal(envStatus('o2', 18.5), 2);
});

test('XP, ranks and achievements', () => {
  const log = Array.from({ length: 35 }, (_, k) => ({ d: k + 1, v: { sleep: 7.5 }, ex: k % 2 ? 130 : 60 }));
  const P = { log, cog: [{ d: 10, pvt: { median: 230 }, score: 90 }, { d: 12, pvt: { median: 260 }, score: 80 }] };
  const xp = xpOf(P);
  assert.equal(xp.total, 35 * 100 + 17 * 50 + 1 * 75);
  assert.equal(rankOf(xp.total).name, 'Specialist');
  assert.equal(rankOf(0).name, 'Flight Cadet');
  assert.equal(rankOf(12000).name, 'Mission Commander');
  const got = Object.fromEntries(achievements(P, 35).map(b => [b.id, b.unlocked]));
  assert.deepEqual(got, { immune: true, neuro: true, survivor: true, adapted: true });
  const r = missionReadiness(analyzeAll(log, 35, mars, false), log, 35, P.cog);
  assert.ok(r.score > 80 && r.score <= 100);
});

// ---- Audio hub, debrief and badge thresholds ----
import { debrief, greeting, BADGES, PVT_ACE_MS } from '../src/engine/index.js';
import { wordsToNumbers, parseAny, parseSpoken } from '../src/ui/audioGuide.js';

test('Neuro-Ace unlocks below 250 ms median reaction time, and the streak badge is Deep Space Veteran', () => {
  assert.equal(PVT_ACE_MS, 250);
  const P = d => ({ log: [{ d: 1, v: {} }], cog: [{ d: 1, pvt: { median: d } }] });
  assert.equal(achievements(P(249), 1).find(b => b.id === 'neuro').unlocked, true);
  assert.equal(achievements(P(251), 1).find(b => b.id === 'neuro').unlocked, false);
  assert.ok(BADGES.some(b => b.name === 'Deep Space Veteran'));
});

test('spoken debrief reads the readings, the drift and the clearance', () => {
  const a = (id, name, val, level = 0, drift = 0, b = 0) => ({ ind: { id, name }, val, level, drift, fit: { b } });
  const A = [a('hr', 'Resting heart rate', 62), a('sys', 'Systolic pressure', 118), a('dia', 'Diastolic pressure', 76), a('spo2', 'Blood oxygen', 98), a('temp', 'Temperature', 36.7)];
  const L = debrief({ rankName: 'Mission Commander', hour: 8, A, readiness: { score: 86 }, day: 90 });
  const t = L.join(' ');
  assert.match(L[0], /^Good morning, Commander\./);
  assert.match(t, /All systems are nominal today/);
  assert.match(t, /resting heart rate is 62 beats per minute/);
  assert.match(t, /blood pressure is 118 over 76/);
  assert.match(t, /temperature is 36\.7 degrees/);
  assert.match(t, /No trend drift detected/);
  assert.match(t, /Mission readiness is 86 percent/);
  assert.match(L[L.length - 1], /cleared for duty/);
  const D = debrief({ rankName: 'Flight Cadet', hour: 20, A: [a('sys', 'Systolic pressure', 132, 2, 2, 0.4), a('dia', 'Diastolic pressure', 84)] }).join(' ');
  assert.match(D, /Good evening, Cadet/);
  assert.match(D, /Systolic pressure is drifting upward/);
  assert.match(D, /cleared with restrictions/);
  assert.equal(greeting(13), 'Good afternoon');
  assert.match(debrief({ A: [] }).join(' '), /no readings yet/);
});

test('hands-free phrases parse to the right reading', () => {
  assert.deepEqual(wordsToNumbers('one twenty over eighty'), [120, 80]);
  assert.deepEqual(parseAny('One twenty over eighty'), { sys: 120, dia: 80 });
  assert.deepEqual(parseAny('Pulse sixty-eight'), { hr: 68 });
  assert.deepEqual(parseAny('SpO2 ninety-eight percent'), { spo2: 98 });
  assert.deepEqual(parseAny('spo2 98%'), { spo2: 98 });
  assert.deepEqual(parseAny('thirty six point eight'), { temp: 36.8 });
  assert.deepEqual(parseAny('fourteen breaths'), { rr: 14 });
  assert.deepEqual(parseSpoken(['SpO2 ninety-eight percent'], 'spo2'), { spo2: 98 });
  assert.deepEqual(parseSpoken(['pulse sixty eight'], 'hr'), { hr: 68 });
  assert.equal(parseAny('hello there'), null);
});
