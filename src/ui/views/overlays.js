// Mission briefing tour (first visit, new crew, or the Briefing button) and the clearance stamp shown after saving.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { esc } from '../format.js';
import { gauge } from '../hud.js';

const ART = {
  clearance: `<svg viewBox="0 0 260 170" aria-hidden="true"><rect x="10" y="8" width="240" height="154" rx="14" fill="var(--panel)" stroke="var(--line)"/>
    <text x="26" y="34" font-size="13" font-weight="700" fill="var(--ink)">Daily flight clearance: 3 of 6</text>
    <rect x="26" y="44" width="208" height="8" rx="4" fill="var(--track)"/><rect x="26" y="44" width="104" height="8" rx="4" fill="var(--s0-fill)"/>
    ${['Heart rate', 'Pressure', 'SpO₂', 'Breathing', 'Temperature', 'Sleep'].map((t, k) => { const x = 26 + (k % 2) * 108, y = 66 + Math.floor(k / 2) * 30, ok = k < 3; return `<rect x="${x}" y="${y}" width="100" height="24" rx="12" fill="${ok ? 'var(--s0-bg)' : 'none'}" stroke="${ok ? 'var(--s0-fill)' : 'var(--line)'}"/><text x="${x + 12}" y="${y + 16}" font-size="11" fill="${ok ? 'var(--s0)' : 'var(--soft)'}">${ok ? '✓ ' : ''}${t}</text>`; }).join('')}</svg>`,
  body: `<svg viewBox="0 0 260 170" aria-hidden="true"><rect x="10" y="8" width="240" height="154" rx="14" fill="#061d4a"/>
    <g fill="none" stroke="#00e5ff" stroke-width="1.6" opacity=".9"><circle cx="130" cy="36" r="13"/><path d="M130 49v52M108 62h44M108 62l-10 40M152 62l10 40M120 101l-6 50M140 101l6 50"/></g>
    <circle cx="130" cy="36" r="5" fill="#00ff9d"/><circle cx="130" cy="70" r="5" fill="#ffb703"/><circle cx="130" cy="96" r="5" fill="#00ff9d"/><circle cx="118" cy="132" r="5" fill="#00ff9d"/>
    <circle cx="130" cy="70" r="13" fill="none" stroke="#ffb703" stroke-width="1.5"><animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite"/></circle>
    <path d="M60 140a70 18 0 0 0 140 0" fill="none" stroke="#00e5ff" stroke-width="1.6" stroke-dasharray="4 4"/><path d="M196 132l6 8-10 2" fill="none" stroke="#00e5ff" stroke-width="1.6"/>
    <rect x="166" y="50" width="76" height="40" rx="6" fill="rgba(5,12,24,.9)" stroke="#00e5ff"/><text x="174" y="66" font-size="10" fill="#e2f7ff" font-weight="700">Cardiopulm.</text><text x="174" y="81" font-size="9" fill="#ffb703">Tell CMO</text></svg>`,
  audio: `<svg viewBox="0 0 260 170" aria-hidden="true"><rect x="10" y="8" width="240" height="154" rx="14" fill="var(--panel)" stroke="var(--line)"/>
    <circle cx="78" cy="85" r="44" fill="none" stroke="var(--track)" stroke-width="8"/><circle cx="78" cy="85" r="44" fill="none" stroke="var(--blue)" stroke-width="8" stroke-dasharray="276" stroke-dashoffset="90" transform="rotate(-90 78 85)" stroke-linecap="round"/>
    <text x="78" y="92" font-size="20" font-weight="700" fill="var(--ink)" text-anchor="middle" font-family="ui-monospace,monospace">00:40</text>
    <rect x="160" y="52" width="26" height="44" rx="13" fill="none" stroke="var(--blue)" stroke-width="3"/><path d="M150 84a23 23 0 0 0 46 0M173 108v12" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linecap="round"/>
    <path d="M208 66q10 14 0 28M220 58q18 22 0 44" fill="none" stroke="var(--s0-fill)" stroke-width="3" stroke-linecap="round"/>
    <text x="130" y="150" font-size="11" fill="var(--soft)" text-anchor="middle">“one twenty over eighty”</text></svg>`
};
export const BRIEF = [
  { k: 'clearance', title: 'Daily flight clearance', body: 'Each morning, a guided check walks you through six vitals, then sleep, fatigue, wellbeing and symptoms. Each vital turns green as you log it. It takes about ten minutes including the timed rests, and earns your duty clearance and 100 XP.', say: 'Step one. Your daily flight clearance. A guided check walks you through six vitals, then sleep, fatigue, wellbeing and symptoms. Each vital turns green as you log it.' },
  { k: 'body', title: '3D body hologram', body: 'Body scan shows each region of the body in its status colour. Drag to rotate it. Tap a glowing hotspot to zoom in and open its diagnostic card, with your readings, what to do, and NASA risk links.', say: 'Step two. The body hologram. Drag to rotate it, and tap a glowing hotspot to zoom in and open its diagnostic card.' },
  { k: 'audio', title: 'Audio coach and timers', body: 'Every measurement has a timer with sound cues and an illustrated technique guide. Turn on Voice in the top bar and a calm voice reads each step. Tap the microphone and say a reading, such as “one twenty over eighty”. The Audio hub has your spoken debrief.', say: 'Step three. Your audio coach. Every measurement has a timer and a technique guide. Turn on voice, and tap the microphone to say a reading, such as one twenty over eighty.' }
];

export function briefHTML(i, P) {
  const b = BRIEF[i], last = i === BRIEF.length - 1;
  return `<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="brief-h"><div class="modal brief">
    <div class="kicker">MISSION BRIEFING · ${i + 1} OF ${BRIEF.length}</div>
    <div class="briefart">${ART[b.k]}</div>
    <h2 id="brief-h" tabindex="-1">${b.title}</h2>
    <p>${b.body}</p>
    <div class="dots" aria-hidden="true">${BRIEF.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="mbar"><button class="btn ghost" data-act="br-close">${last ? 'Explore first' : 'Skip briefing'}</button><span style="flex:1"></span>
      <button class="btn" data-act="br-say" aria-label="Read this step aloud">🔊 Read aloud</button>
      ${i > 0 ? '<button class="btn" data-act="br-back">Back</button>' : ''}
      ${last ? `<button class="btn primary" data-act="br-go">Start ${esc(P.log.length ? 'today’s' : 'my first')} clearance</button>` : '<button class="btn primary" data-act="br-next">Next</button>'}</div>
  </div></div>`;
}

const STAMP = [
  { cls: 'go', big: 'Flight cleared', sub: 'for mission day' },
  { cls: 'go', big: 'Flight cleared', sub: 'watch item noted · day' },
  { cls: 'restrict', big: 'Cleared with restrictions', sub: 'tell your CMO · day' },
  { cls: 'nogo', big: 'Not cleared', sub: 'medical review · day' }
];
export function stampHTML(st) {
  const s = STAMP[st.top], rd = st.rd;
  return `<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="stamp-h"><div class="modal stampcard">
    <div class="stamp ${s.cls}"><b>${s.big}</b><span>${s.sub} ${String(st.day).padStart(3, '0')}</span></div>
    <h2 id="stamp-h" tabindex="-1" class="sr">${s.big} ${s.sub} ${st.day}</h2>
    <div class="stampbody">${gauge(rd)}
      <div class="earned"><div class="lbl">Rewards</div><p class="xpgain">+${st.xp} XP</p><p class="soft small">${st.rank}${st.rankUp ? ' · <b class="s0">rank up!</b>' : ''} · ${st.streak}-day streak</p>
      ${st.badges.length ? `<p class="newbadges">${st.badges.map(b => `<span>${b.icon} ${b.name}</span>`).join('')}</p>` : ''}</div></div>
    <p class="mbar"><button class="btn primary big" data-act="stamp-close">See today's assessment</button></p>
  </div></div>`;
}
