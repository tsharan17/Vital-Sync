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
