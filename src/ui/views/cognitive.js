// Weekly cognitive battery: psychomotor vigilance (attention), constellation sequence (memory) and reticle tracking (fine motor).
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { pvtStats, memoryScore, trackingScore, cognitiveScore, PVT_FATIGUE_MS, PVT_ACE_MS } from '../../engine/index.js';
import { sfx } from '../soundFx.js';
import { voice } from '../audioGuide.js';
import { esc } from '../format.js';

const G = { tab: 'pvt', res: {}, run: null };
const TESTS = { pvt: ['Attention', 'Reaction test, 60 seconds'], memory: ['Memory', 'Constellation sequence'], tracking: ['Fine motor', 'Reticle tracking, 15 seconds'] };
const NODES = [[24, 30], [68, 20], [80, 66], [34, 76]];
const PITCH = [523, 659, 784, 988];
export const cogState = G;

export function stop() {
  const r = G.run; if (!r) return;
  r.timers.forEach(clearTimeout); if (r.raf) cancelAnimationFrame(r.raf); G.run = null;
}

function arena() {
  const t = G.tab;
  if (t === 'pvt') return `<div class="arena" id="arena" tabindex="0" aria-label="Reaction test area. Press space or tap when the beacon turns green."><div class="msg" id="amsg">Tap the beacon or press space the moment it turns green. Wait for it; early taps count against you.</div><div class="beacon" id="beacon"></div></div>`;
  if (t === 'memory') return `<div class="arena" id="arena"><svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${NODES.concat([NODES[0]]).map(n => n.join(',')).join(' ')}" fill="none" stroke="rgba(0,229,255,.25)" stroke-width=".4" stroke-dasharray="1 1.4"/></svg><div class="msg" id="amsg">Watch the stars light up, then repeat the sequence. It starts at 3 and grows by one each round.</div>${NODES.map((n, k) => `<button class="node" data-node="${k}" style="left:${n[0]}%;top:${n[1]}%" aria-label="Star ${k + 1}"></button>`).join('')}</div>`;
  return `<div class="arena" id="arena" tabindex="0" aria-label="Tracking area. Move the pointer, or use the arrow keys, to keep the reticle on the drifting target."><div class="msg" id="amsg">Keep the reticle on the drifting amber target for 15 seconds. Move your finger or mouse, or use the arrow keys.</div><div class="target" id="tgt" style="left:50%;top:50%"></div><div class="reticle" id="ret" style="left:50%;top:50%"></div></div>`;
}
const resLine = (k, r) => {
  if (!r) return `<li><span>${TESTS[k][0]}</span><span class="soft">Not run</span></li>`;
  if (k === 'pvt') return `<li><span>${TESTS[k][0]}</span><span class="num ${r.fatigued ? 's2' : 's0'}">${r.median == null ? 'no responses' : Math.round(r.median) + ' ms median'}, ${r.lapses} lapses · ${r.score}</span></li>`;
  if (k === 'memory') return `<li><span>${TESTS[k][0]}</span><span class="num s0">sequence of ${r.level} · ${r.score}</span></li>`;
  return `<li><span>${TESTS[k][0]}</span><span class="num s0">${Math.round(r.on * 100)}% on target · ${r.score}</span></li>`;
};

export function view(ctx) {
  const { P, day } = ctx, R = G.res, comb = cognitiveScore({ pvt: R.pvt?.score, memory: R.memory?.score, tracking: R.tracking?.score });
  const hist = (P.cog || []).slice(-6).reverse();
  const band = `<section class="band"><div class="wrap"><div class="frame"><div class="kicker">WEEKLY NEURO-PERFORMANCE BATTERY · +75 XP</div><h1>Cognitive battery</h1><p class="lede">Three short tests of attention, memory and fine motor control. Fatigue, carbon dioxide and radiation can slow all three before you notice it yourself.</p></div></div></section>`;
  return band + `<div class="wrap page grid">
  <div class="quick" role="tablist">${Object.entries(TESTS).map(([k, [n, d]]) => `<button role="tab" data-act="cog-tab" data-id="${k}" aria-pressed="${G.tab === k}">${n}: ${d}${R[k] ? ' ✓' : ''}</button>`).join('')}</div>
  <div class="grid scan">
    <section class="panel br">${arena()}<p style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary big" id="gstart">Start ${TESTS[G.tab][0].toLowerCase()} test</button></p></section>
    <div class="grid" style="align-content:start">
      <section class="panel"><div class="lbl">This session</div><ul class="plain duelist">${Object.keys(TESTS).map(k => resLine(k, R[k])).join('')}</ul>
        <div class="score" style="margin-top:14px"><b class="num s1">${comb ?? '–'}</b><span class="soft">cognitive fitness score, 0 to 100</span></div>
        ${R.pvt?.fatigued ? `<p class="note" style="margin-top:12px">Median reaction time is above ${PVT_FATIGUE_MS} ms, a sign of fatigue. Avoid safety-critical tasks until you have rested, and check cabin carbon dioxide.</p>` : ''}
        ${R.pvt && R.pvt.median != null && R.pvt.median < PVT_ACE_MS ? '<p class="note info" style="margin-top:12px">⚡ Sub-240 ms median: Neuro-Ace badge unlocked when you save.</p>' : ''}
        <p style="margin-top:14px"><button class="btn go" data-act="cog-save" ${comb == null ? 'disabled' : ''}>Save battery to mission day ${day}</button></p></section>
      <section class="panel"><div class="lbl">Previous sessions</div>${hist.length ? `<ul class="plain duelist">${hist.map(c => `<li><span>Day ${c.d}</span><span class="num">${c.score}${c.pvt && c.pvt.median ? ` · ${Math.round(c.pvt.median)} ms` : ''}</span></li>`).join('')}</ul>` : '<p class="soft">No sessions yet. Run the battery once a week, at about the same time of day.</p>'}</section>
    </div></div>
  <p class="small soft">The attention test follows the psychomotor vigilance task used in spaceflight research, shortened to 60 seconds; scores are for tracking your own trend, not for diagnosis.</p></div>`;
}

export function mount(rerender) {
  stop();
  const btn = document.getElementById('gstart'), ar = document.getElementById('arena'), msg = document.getElementById('amsg');
  if (!btn || !ar) return;
  const finish = () => { stop(); sfx.chime(); rerender(); };
  btn.onclick = () => {
    btn.disabled = true; sfx.confirm();
    const run = G.run = { timers: [], raf: 0 };
    if (G.tab === 'pvt') {
      const b = document.getElementById('beacon'), rts = []; let on = 0, fs = 0, end = performance.now() + 60000;
      voice.say('Attention test. Tap when the beacon turns green.');
      const arm = () => { if (G.run !== run) return; const wait = 2000 + Math.random() * 4000; if (performance.now() + wait > end) { run.timers.push(setTimeout(done, Math.max(0, end - performance.now()))); return; } run.timers.push(setTimeout(() => { if (G.run !== run) return; on = performance.now(); b.classList.add('on'); sfx.blip(); run.timers.push(setTimeout(() => { if (on) { rts.push(1000); on = 0; b.classList.remove('on'); msg.textContent = 'Missed. Stay with it.'; arm(); } }, 1000)); }, wait)); };
      const hit = () => { if (G.run !== run) return; if (!on) { fs++; sfx.error(); msg.textContent = `Too early. ${fs} early tap${fs > 1 ? 's' : ''}.`; return; } const rt = performance.now() - on; on = 0; rts.push(rt); b.classList.remove('on'); msg.textContent = `${Math.round(rt)} ms · ${rts.length} responses · ${Math.max(0, Math.ceil((end - performance.now()) / 1000))} s left`; arm(); };
      const done = () => { G.res.pvt = pvtStats(rts, fs); voice.say(`Attention test complete. Median ${Math.round(G.res.pvt.median || 0)} milliseconds.`); finish(); };
      ar.onpointerdown = e => { e.preventDefault(); hit(); };
      ar.onkeydown = e => { if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); hit(); } };
      ar.focus(); msg.textContent = 'Get ready…'; arm();
    } else if (G.tab === 'memory') {
      const nodes = [...ar.querySelectorAll('.node')]; let len = 3, best = 2, seq = [], pos = 0, input = false;
      const flash = (k, cls, ms) => { nodes[k].classList.add(cls); run.timers.push(setTimeout(() => nodes[k].classList.remove(cls), ms)); };
      const round = () => {
        if (G.run !== run) return; input = false; pos = 0; seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
        msg.textContent = `Watch: sequence of ${len}`;
        seq.forEach((k, i) => run.timers.push(setTimeout(() => { flash(k, 'lit', 450); toneFor(k); }, 600 + i * 700)));
        run.timers.push(setTimeout(() => { input = true; msg.textContent = 'Your turn: repeat the sequence'; }, 600 + len * 700));
      };
      const toneFor = k => { try { sfx.blip(); } catch (e) {} };
      nodes.forEach((n, k) => { n.onclick = () => {
        if (!input || G.run !== run) return;
        if (k === seq[pos]) { flash(k, 'ok', 250); sfx.select(); pos++; if (pos === seq.length) { best = len; input = false; if (len >= 9) return end(); len++; msg.textContent = 'Correct'; run.timers.push(setTimeout(round, 900)); } }
        else { flash(k, 'bad', 500); sfx.error(); end(); }
      }; });
      const end = () => { input = false; G.res.memory = { level: best, score: memoryScore(best) }; voice.say(`Memory test complete. Longest sequence ${best}.`); run.timers.push(setTimeout(finish, 700)); };
      voice.say('Memory test. Watch the stars, then repeat the sequence.'); round();
    } else {
      const tg = document.getElementById('tgt'), rt = document.getElementById('ret'), box = ar.getBoundingClientRect(); let px = box.width / 2, py = box.height / 2, onN = 0, n = 0; const t0 = performance.now();
      const set = (x, y) => { px = Math.max(0, Math.min(box.width, x)); py = Math.max(0, Math.min(box.height, y)); rt.style.left = px + 'px'; rt.style.top = py + 'px'; };
      ar.onpointermove = e => { const b = ar.getBoundingClientRect(); set(e.clientX - b.left, e.clientY - b.top); };
      ar.onpointerdown = ar.onpointermove;
      ar.onkeydown = e => { const s = 18, m = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key]; if (m) { e.preventDefault(); set(px + m[0], py + m[1]); } };
      ar.focus(); voice.say('Tracking test. Keep the reticle on the target.');
      const step = ts => {
        if (G.run !== run) return; const t = (ts - t0) / 1000, b = ar.getBoundingClientRect();
        const tx = b.width * (0.5 + 0.34 * Math.sin(t * 0.9) * Math.cos(t * 0.23)), ty = b.height * (0.52 + 0.3 * Math.sin(t * 1.3 + 1));
        tg.style.left = tx + 'px'; tg.style.top = ty + 'px';
        const hit = Math.hypot(tx - px, ty - py) < 30; n++; if (hit) onN++; rt.classList.toggle('on', hit);
        msg.textContent = `${Math.max(0, 15 - t).toFixed(1)} s · ${Math.round(onN / n * 100)}% on target`;
        if (t >= 15) { G.res.tracking = { on: onN / n, score: trackingScore(onN / n) }; voice.say(`Tracking complete. ${Math.round(onN / n * 100)} percent on target.`); return finish(); }
        run.raf = requestAnimationFrame(step);
      };
      run.raf = requestAnimationFrame(step);
    }
  };
}
export const _esc = esc;
