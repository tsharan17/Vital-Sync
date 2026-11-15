// Glowing technical schematics for each instrument, shown beside the step-by-step instructions.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
const C = '#00e5ff', G = '#00ff9d', A = '#ffb703', Rd = '#ff2a5f';
const glow = c => `style="filter:drop-shadow(0 0 4px ${c})"`;
const wrap = (title, body, h = 204) => `<svg class="diag" viewBox="0 0 320 ${h}" role="img" aria-label="${title}"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${G}"/></marker></defs><rect x="1" y="1" width="318" height="${h - 2}" rx="12" fill="rgba(0,229,255,.03)" stroke="rgba(0,229,255,.25)"/>${body}</svg>`;

const D = {
  cuff: () => wrap('Blood pressure cuff placement on the upper arm', `
    <line x1="14" y1="88" x2="306" y2="88" stroke="${G}" stroke-dasharray="3 5" opacity=".7"/><text x="16" y="80" class="lab">heart level</text>
    <rect x="20" y="70" width="190" height="40" rx="20" fill="rgba(0,229,255,.06)" stroke="${C}" stroke-width="1.5" ${glow(C)}/>
    <rect x="206" y="74" width="96" height="32" rx="16" fill="rgba(0,229,255,.06)" stroke="${C}" stroke-width="1.5"/>
    <line x1="210" y1="60" x2="210" y2="122" stroke="${A}" stroke-dasharray="4 3"/><text x="214" y="58" style="fill:${A}">elbow crease</text>
    <path d="M24 100 H300" stroke="${Rd}" stroke-width="2" stroke-dasharray="7 4" ${glow(Rd)}/><text x="196" y="126" style="fill:${Rd}">brachial artery</text>
    <rect x="112" y="60" width="70" height="60" rx="6" fill="rgba(0,229,255,.18)" stroke="${C}" stroke-width="2" ${glow(C)}/>
    <text x="118" y="54">cuff</text>
    <path d="M147 120 l-6 9 h12z" fill="${G}"/><text x="94" y="146" class="lab">artery marker over artery</text>
    <path d="M184 164 H208" stroke="${G}" stroke-width="1.5" marker-start="url(#ah)" marker-end="url(#ah)"/><line x1="182" y1="120" x2="182" y2="170" stroke="${G}" stroke-dasharray="2 3"/>
    <text x="96" y="184" class="lab">lower edge 2–3 cm above crease</text>`),
  pulse: () => wrap('Finding the radial pulse on the wrist', `
    <rect x="16" y="78" width="170" height="52" rx="22" fill="rgba(0,229,255,.06)" stroke="${C}" stroke-width="1.5"/>
    <path d="M186 74 h60 q34 0 34 30 v4 q0 26 -34 26 h-60z" fill="rgba(0,229,255,.06)" stroke="${C}" stroke-width="1.5" ${glow(C)}/>
    <path d="M232 74 q10 -34 40 -40" fill="none" stroke="${C}" stroke-width="1.5"/><text x="250" y="28">thumb side</text>
    <path d="M20 90 H190" stroke="${Rd}" stroke-width="2" stroke-dasharray="7 4" ${glow(Rd)}/><text x="22" y="70" style="fill:${Rd}">radial artery</text>
    <circle cx="150" cy="90" r="9" fill="rgba(0,255,157,.35)" stroke="${G}" stroke-width="2" ${glow(G)}/><circle cx="170" cy="90" r="9" fill="rgba(0,255,157,.35)" stroke="${G}" stroke-width="2" ${glow(G)}/>
    <text x="60" y="158" class="lab">two fingertips here, not your thumb</text>`, 180),
  oxi: () => wrap('Pulse oximeter finger placement', `
    <path d="M20 96 h150 q40 0 40 22 q0 22 -40 22 h-150z" fill="rgba(0,229,255,.06)" stroke="${C}" stroke-width="1.5"/>
    <path d="M150 96 q30 -6 52 10" fill="none" stroke="${C}" stroke-width="2"/><text x="132" y="88">nail up</text>
    <rect x="120" y="64" width="150" height="34" rx="10" fill="rgba(0,255,157,.12)" stroke="${G}" stroke-width="2" ${glow(G)}/>
    <rect x="120" y="138" width="150" height="34" rx="10" fill="rgba(0,255,157,.12)" stroke="${G}" stroke-width="2" ${glow(G)}/>
    <circle cx="182" cy="96" r="6" fill="${Rd}" ${glow(Rd)}/><text x="196" y="58" style="fill:${Rd}">LED (red light)</text>
    <rect x="174" y="136" width="16" height="6" fill="${C}"/><text x="196" y="190">sensor underneath</text>
    <line x1="252" y1="100" x2="252" y2="136" stroke="${A}" stroke-width="2"/><text x="256" y="122" style="fill:${A}">end stop</text>
    <path d="M30 70 H96" stroke="${G}" stroke-width="2" marker-end="url(#ah)"/><text x="20" y="62" class="lab">insert fully</text>`),
  thermo: () => wrap('Temporal and ear thermometer technique', `
    <ellipse cx="150" cy="104" rx="82" ry="86" fill="rgba(0,229,255,.05)" stroke="${C}" stroke-width="1.5" ${glow(C)}/>
    <ellipse cx="232" cy="110" rx="12" ry="22" fill="rgba(0,229,255,.08)" stroke="${C}" stroke-width="1.5"/>
    <path d="M120 54 Q170 36 214 70" fill="none" stroke="${G}" stroke-width="3" marker-end="url(#ah)" ${glow(G)}/>
    <text x="78" y="40" class="lab">forehead sweep to temple</text>
    <circle cx="120" cy="54" r="5" fill="${G}"/>
    <path d="M300 92 L246 108" stroke="${A}" stroke-width="5" stroke-linecap="round" ${glow(A)}/>
    <path d="M246 108 L120 140" stroke="${A}" stroke-dasharray="3 5"/><text x="96" y="194" style="fill:${A}">ear probe aimed at opposite eye</text>
    <text x="168" y="148">pull ear up and back</text>`),
  lancet: () => wrap('Lancet site and glucose strip', `
    <rect x="40" y="30" width="80" height="150" rx="40" fill="rgba(0,229,255,.06)" stroke="${C}" stroke-width="1.5" ${glow(C)}/>
    <ellipse cx="80" cy="66" rx="20" ry="22" fill="rgba(255,42,95,.1)" stroke="${Rd}" stroke-dasharray="3 3"/>
    <path d="M72 58 l16 16 M88 58 l-16 16" stroke="${Rd}" stroke-width="2.5"/><text x="128" y="44" style="fill:${Rd}">not the pad</text>
    <circle cx="44" cy="74" r="6" fill="${G}" ${glow(G)}/><circle cx="116" cy="74" r="6" fill="${G}" ${glow(G)}/>
    <text x="128" y="80" class="lab">side of fingertip</text>
    <rect x="196" y="96" width="78" height="70" rx="10" fill="rgba(0,229,255,.08)" stroke="${C}" stroke-width="1.5"/>
    <text x="210" y="134" style="font-size:18px">mg/dL</text>
    <rect x="226" y="72" width="18" height="26" fill="rgba(255,183,3,.25)" stroke="${A}" stroke-width="1.5"/>
    <circle cx="235" cy="64" r="7" fill="${Rd}" ${glow(Rd)}/><text x="96" y="196" style="fill:${A}">touch the drop to the strip edge</text>`, 206),
  lungs: () => wrap('Counting breaths', `
    <path d="M160 26 v40 M160 66 q-14 6 -20 22 M160 66 q14 6 20 22" stroke="${C}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M138 44 c-26 6 -52 44 -52 86 0 18 12 26 28 24 18 -3 24 -18 24 -36 V58 c0 -8 -2 -12 0 -14z" fill="rgba(0,229,255,.16)" stroke="${C}" stroke-width="2" ${glow(C)}/>
    <path d="M182 44 c26 6 52 44 52 86 0 18 -12 26 -28 24 -18 -3 -24 -18 -24 -36 V58 c0 -8 2 -12 0 -14z" fill="rgba(0,229,255,.16)" stroke="${C}" stroke-width="2" ${glow(C)}/>
    <path d="M60 176 q100 -26 200 0" fill="none" stroke="${G}" stroke-width="2"/><path d="M160 196 V172" stroke="${G}" stroke-width="2" marker-end="url(#ah)"/>
    <text x="20" y="194" class="lab">one rise and fall = one breath</text>`, 206)
};
export const diagram = key => (D[key] ? D[key]() : '');
export function tutorial(ind) {
  if (!ind.tool || !ind.tut) return '';
  return `<div class="tut">${diagram(ind.tool)}<div><div class="lbl">Step by step</div><ol>${ind.tut.map(t => `<li>${t}</li>`).join('')}</ol></div></div>`;
}
