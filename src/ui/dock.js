// Audio dock: a floating player that appears whenever Vital Sync is reading something aloud.
// Play or pause, repeat from the start, previous and next line, stop. Captions show the line being spoken.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { player, voice } from './audioGuide.js';
import { sfx } from './soundFx.js';

const I = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC = {
  play: I('<path d="M7 5l12 7-12 7z" fill="currentColor"/>'), pause: I('<path d="M8 5v14M16 5v14"/>'),
  repeat: I('<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>'), prev: I('<path d="M18 6l-8 6 8 6zM6 6v12"/>'),
  next: I('<path d="M6 6l8 6-8 6zM18 6v12"/>'), stop: I('<rect x="6" y="6" width="12" height="12" rx="2"/>')
};
let el = null, finished = false;

export function mountDock() {
  if (el) return;
  el = document.createElement('section'); el.id = 'dock'; el.className = 'dock'; el.hidden = true;
  el.setAttribute('aria-label', 'Audio player');
  document.body.appendChild(el);
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-dk]'); if (!b) return;
    const k = b.dataset.dk; sfx.select();
    if (k === 'toggle') { if (finished) { finished = false; player.repeat(); } else player.toggle(); }
    else if (k === 'repeat') { finished = false; player.repeat(); }
    else if (k === 'prev') player.back();
    else if (k === 'next') player.next();
    else if (k === 'stop') { finished = false; player.stop(); el.hidden = true; }
  });
  player.on(draw);
}
function draw(st) {
  if (!el) return;
  if (st.status === 'idle' && !st.done) { if (!finished) el.hidden = true; return; }
  finished = st.status === 'idle' && !!st.done;
  const line = st.lines[st.i], text = typeof line === 'object' ? line.text : line, phase = typeof line === 'object' ? line.phase : null;
  const playing = st.status === 'playing';
  el.hidden = false;
  el.className = `dock ${playing ? 'playing' : ''} ${phase ? 'breath-' + phase : ''}`;
  el.innerHTML = `<div class="dk-viz" aria-hidden="true">${phase ? '<i class="pace"></i>' : '<span></span><span></span><span></span><span></span>'}</div>
    <div class="dk-txt"><b>${st.title}</b><span class="dk-cap" aria-live="polite">${finished ? 'Finished. Press repeat to hear it again.' : phase ? (phase === 'in' ? 'Breathe in… 2… 3… 4' : 'Breathe out… 2… 3… 4') : text || ''}</span>
      <span class="dk-meta">${finished ? 'Done' : `Line ${st.i + 1} of ${st.lines.length}`}${voice.canSpeak ? '' : ' · captions only: no speech in this browser'}</span></div>
    <div class="dk-ctl">
      <button data-dk="prev" aria-label="Previous line" ${st.i === 0 || finished ? 'disabled' : ''}>${IC.prev}</button>
      <button data-dk="toggle" class="main" aria-label="${playing ? 'Pause' : 'Play'}">${playing ? IC.pause : IC.play}</button>
      <button data-dk="next" aria-label="Next line" ${st.i >= st.lines.length - 1 || finished ? 'disabled' : ''}>${IC.next}</button>
      <button data-dk="repeat" aria-label="Repeat from the start">${IC.repeat}</button>
      <button data-dk="stop" aria-label="Stop and close the player">${IC.stop}</button>
    </div>`;
}
