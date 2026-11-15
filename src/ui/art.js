// Game-style station illustrations: one per screen, drawn with the theme's colour tokens so they follow light
// and satellite modes. Used in each screen's title band and on the Mission deck cards.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
const B = 'var(--blue)', G = 'var(--s0-fill)', A = 'var(--s2-fill)', R = 'var(--s3-fill)', K = 'var(--ink)', S = 'var(--soft)', T = 'var(--track)', F = 'var(--tint2)';
const svg = (label, body) => `<svg class="art" viewBox="0 0 320 200" role="img" aria-label="${label}">${body}</svg>`;
const chip = (x, y, t, c = G, w = null) => { const ww = w || t.length * 7.2 + 18; return `<g><rect x="${x}" y="${y}" width="${ww}" height="22" rx="11" fill="none" stroke="${c}" stroke-width="1.6"/><text x="${x + ww / 2}" y="${y + 15}" font-size="11.5" font-weight="700" fill="${c}" text-anchor="middle">${t}</text></g>`; };
const star = (x, y, r, c = A) => { const p = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; p.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`); } return `<polygon points="${p.join(' ')}" fill="${c}"/>`; };
const sparks = `${star(28, 30, 4, S)}${star(306, 192, 3, S)}${star(300, 26, 3, S)}<circle cx="60" cy="176" r="1.6" fill="${S}"/><circle cx="270" cy="60" r="1.6" fill="${S}"/>`;
const ring = (cx, cy, r, pct, c = B, w = 8) => { const C = 2 * Math.PI * r; return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T}" stroke-width="${w}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`; };

export const ART = {
  'check-in': svg('A clearance shield with a heartbeat line, circled by six vital signs, three of them already logged', `${sparks}
    <ellipse cx="160" cy="104" rx="118" ry="44" fill="none" stroke="${T}" stroke-width="2" stroke-dasharray="5 6"/>
    ${[[42, 104, 1], [80, 140, 1], [160, 148, 1], [240, 140, 0], [278, 104, 0], [240, 68, 0]].map(([x, y, ok]) => `<circle cx="${x}" cy="${y}" r="10" fill="${ok ? G : 'none'}" stroke="${ok ? G : S}" stroke-width="2"/>${ok ? `<path d="M${x - 4} ${y}l3 3 6-6" stroke="var(--on-accent)" stroke-width="2.2" fill="none" stroke-linecap="round"/>` : ''}`).join('')}
    <path d="M160 34l46 16v34c0 32-20 52-46 64-26-12-46-32-46-64V50z" fill="${F}" stroke="${B}" stroke-width="3"/>
    <path d="M128 92h12l6-12 10 26 8-18 5 4h15" fill="none" stroke="${G}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${chip(232, 16, '+100 XP', A)}`),
  today: svg('A planet sunrise behind a readiness gauge, a tilted cleared stamp and a checked quest list', `${sparks}
    <path d="M0 200a200 70 0 0 1 320 0z" fill="${F}" stroke="${B}" stroke-width="2"/><circle cx="250" cy="150" r="22" fill="none" stroke="${A}" stroke-width="3"/>${[0, 45, 90, 135, 180].map(a => `<path d="M${250 - 32 * Math.cos(a * Math.PI / 180)} ${150 - 32 * Math.sin(a * Math.PI / 180)}l${-8 * Math.cos(a * Math.PI / 180)} ${-8 * Math.sin(a * Math.PI / 180)}" stroke="${A}" stroke-width="3" stroke-linecap="round"/>`).join('')}
    ${ring(78, 82, 44, 0.74)}<text x="78" y="90" font-size="24" font-weight="800" fill="${K}" text-anchor="middle">GO</text><text x="78" y="104" font-size="9" fill="${S}" text-anchor="middle" letter-spacing="1.5">READY</text>
    <g transform="rotate(-8 214 52)"><rect x="150" y="30" width="130" height="44" rx="6" fill="none" stroke="${G}" stroke-width="3"/><rect x="155" y="35" width="120" height="34" rx="4" fill="none" stroke="${G}" stroke-width="1.2"/><text x="215" y="58" font-size="16" font-weight="900" fill="${G}" text-anchor="middle" letter-spacing="2">CLEARED</text></g>
    ${[0, 1, 2].map(k => `<rect x="150" y="${92 + k * 20}" width="12" height="12" rx="3" fill="${k < 2 ? G : 'none'}" stroke="${k < 2 ? G : S}" stroke-width="1.6"/><rect x="170" y="${96 + k * 20}" width="${70 - k * 14}" height="5" rx="2.5" fill="${T}"/>`).join('')}`),
  body: svg('A holographic human figure with a horizontal scan beam and glowing hotspots', `${sparks}
    <ellipse cx="160" cy="184" rx="70" ry="10" fill="none" stroke="${B}" stroke-width="2"/>
    <g fill="${F}" stroke="${B}" stroke-width="2.4" stroke-linejoin="round"><circle cx="160" cy="34" r="16"/><path d="M136 58q24-8 48 0l8 52-10 4-6-34v40l6 60h-14l-8-50-8 50h-14l6-60V80l-6 34-10-4z"/></g>
    <rect x="70" y="96" width="180" height="4" rx="2" fill="${G}" opacity=".9"/><rect x="70" y="90" width="180" height="16" fill="${G}" opacity=".12"/>
    <circle cx="160" cy="34" r="5" fill="${G}"/><circle cx="160" cy="70" r="6" fill="${A}"/><circle cx="160" cy="70" r="13" fill="none" stroke="${A}" stroke-width="2"/><circle cx="160" cy="104" r="5" fill="${G}"/><circle cx="150" cy="150" r="5" fill="${G}"/>
    ${chip(222, 22, 'SCAN', B, 58)}${chip(16, 120, 'hotspots', A)}`),
  trends: svg('A rising trend line with a shaded forecast cone reaching a dashed limit, and a star where it was caught early', `${sparks}
    <path d="M36 168H296M36 168V30" stroke="${S}" stroke-width="2"/>
    <path d="M36 62H296" stroke="${A}" stroke-width="2" stroke-dasharray="7 6"/>
    <polygon points="196,112 296,46 296,96" fill="${A}" opacity=".18"/>
    <polyline points="40,146 60,140 78,148 96,132 116,138 134,124 152,128 170,116 188,118 196,112" fill="none" stroke="${B}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M196 112L296 70" stroke="${A}" stroke-width="2.4" stroke-dasharray="2 5" stroke-linecap="round"/>
    <circle cx="196" cy="112" r="7" fill="var(--bg)" stroke="${B}" stroke-width="3"/>
    ${star(196, 86, 11, G)}${chip(176, 16, 'caught early', G)}`),
  audio: svg('A headset over sound-wave bars and a speech bubble reading Good morning, Commander', `${sparks}
    <path d="M70 120V96a50 50 0 0 1 100 0v24" fill="none" stroke="${B}" stroke-width="5" stroke-linecap="round"/>
    <rect x="56" y="112" width="26" height="44" rx="10" fill="${F}" stroke="${B}" stroke-width="3"/><rect x="158" y="112" width="26" height="44" rx="10" fill="${F}" stroke="${B}" stroke-width="3"/>
    ${[18, 34, 52, 30, 60, 40, 24, 46, 20].map((h, k) => `<rect x="${196 + k * 12}" y="${150 - h}" width="7" height="${h}" rx="3.5" fill="${k % 3 === 1 ? G : B}"/>`).join('')}
    <path d="M190 22h112a10 10 0 0 1 10 10v30a10 10 0 0 1-10 10h-70l-14 14v-14h-28a10 10 0 0 1-10-10V32a10 10 0 0 1 10-10z" fill="none" stroke="${G}" stroke-width="2"/>
    <text x="246" y="45" font-size="11.5" font-weight="700" fill="${K}" text-anchor="middle">Good morning,</text><text x="246" y="60" font-size="11.5" font-weight="700" fill="${K}" text-anchor="middle">Commander.</text>`),
  cognitive: svg('A brain beside a lightning bolt, a connected constellation and a 245 millisecond reaction time', `${sparks}
    <path d="M98 50c-22 0-34 18-30 34-14 8-14 30 0 38 0 18 18 30 34 24 6 10 26 10 30-2V56c-4-10-20-14-34-6z" fill="${F}" stroke="${B}" stroke-width="3"/>
    <path d="M150 56c4-10 22-14 34-6 22 0 34 18 30 34 14 8 14 30 0 38 0 18-18 30-34 24-6 10-26 10-30-2z" fill="${F}" stroke="${B}" stroke-width="3"/>
    <path d="M96 84q14 6 24-4M90 112q16-4 26 8M178 84q-14 6-24-4M184 112q-16-4-26 8" fill="none" stroke="${B}" stroke-width="2" stroke-linecap="round"/>
    <path d="M150 62l-18 40h16l-8 36 26-48h-16l10-28z" fill="${A}"/>
    <polyline points="246,40 284,58 270,98 236,86 246,40" fill="none" stroke="${S}" stroke-width="1.6" stroke-dasharray="4 4"/>${[[246, 40], [284, 58], [270, 98], [236, 86]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="${k === 2 ? 8 : 6}" fill="${k === 2 ? G : B}"/>`).join('')}
    ${chip(222, 128, '⚡ reaction', G, 86)}${chip(222, 158, '+75 XP', A, 86)}`),
  protocol: svg('A mission calendar with checked days, one task due, and a weekly set progress chip', `${sparks}
    <rect x="44" y="34" width="176" height="140" rx="12" fill="${F}" stroke="${B}" stroke-width="3"/><path d="M44 62H220" stroke="${B}" stroke-width="3"/><path d="M80 24v18M184 24v18" stroke="${B}" stroke-width="4" stroke-linecap="round"/>
    ${Array.from({ length: 21 }, (_, k) => { const x = 56 + (k % 7) * 22, y = 74 + Math.floor(k / 7) * 30, st = k < 16 ? 1 : k === 16 ? 2 : 0; return `<rect x="${x}" y="${y}" width="16" height="20" rx="4" fill="${st === 1 ? G : 'none'}" stroke="${st === 1 ? G : st === 2 ? A : S}" stroke-width="1.8"/>${st === 2 ? `<text x="${x + 8}" y="${y + 15}" font-size="12" font-weight="800" fill="${A}" text-anchor="middle">!</text>` : ''}`; }).join('')}
    ${chip(232, 40, 'weekly set', A, 78)}${star(270, 110, 16, G)}<text x="270" y="146" font-size="11" fill="${S}" text-anchor="middle">streak</text>`),
  systems: svg('A spacecraft cabin module with dials for carbon dioxide and oxygen and a radiation symbol', `${sparks}
    <rect x="40" y="70" width="190" height="70" rx="35" fill="${F}" stroke="${B}" stroke-width="3"/><rect x="230" y="88" width="34" height="34" rx="6" fill="none" stroke="${B}" stroke-width="3"/><path d="M264 105h30M282 92v26" stroke="${B}" stroke-width="3"/>
    ${[78, 112, 146, 180].map(x => `<circle cx="${x}" cy="105" r="9" fill="var(--bg)" stroke="${B}" stroke-width="2"/>`).join('')}
    ${ring(84, 34, 20, 0.55, G, 6)}<text x="84" y="38" font-size="10" font-weight="800" fill="${K}" text-anchor="middle">CO₂</text>
    ${ring(150, 34, 20, 0.86, B, 6)}<text x="150" y="38" font-size="10" font-weight="800" fill="${K}" text-anchor="middle">O₂</text>
    <g transform="translate(214 34)"><circle r="20" fill="none" stroke="${A}" stroke-width="2.5"/><circle r="4" fill="${A}"/>${[0, 120, 240].map(a => `<path d="M0 0L${(17 * Math.cos((a - 90) * Math.PI / 180)).toFixed(1)} ${(17 * Math.sin((a - 90) * Math.PI / 180)).toFixed(1)}A17 17 0 0 1 ${(17 * Math.cos((a - 30) * Math.PI / 180)).toFixed(1)} ${(17 * Math.sin((a - 30) * Math.PI / 180)).toFixed(1)}Z" fill="${A}" opacity=".85"/>`).join('')}</g>
    ${chip(56, 156, 'cabin air', G)}`),
  'ground-link': svg('Earth and a spacecraft joined by a dashed signal beam carrying data packets, with a 20 minute delay chip', `${sparks}
    <circle cx="66" cy="110" r="44" fill="${F}" stroke="${B}" stroke-width="3"/><path d="M40 92q14-10 24 2t20 0M44 124q16 8 30-4M80 138q6-8 14-4" fill="none" stroke="${G}" stroke-width="3" stroke-linecap="round"/>
    <path d="M112 100Q180 40 248 74" fill="none" stroke="${B}" stroke-width="2.4" stroke-dasharray="7 7"/>${[[150, 66], [190, 54], [226, 62]].map(([x, y]) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="3" fill="${G}" transform="rotate(45 ${x} ${y})"/>`).join('')}
    <g transform="translate(264 86) rotate(-20)"><rect x="-16" y="-10" width="32" height="20" rx="6" fill="${F}" stroke="${B}" stroke-width="2.5"/><rect x="-44" y="-6" width="24" height="12" fill="none" stroke="${B}" stroke-width="2"/><rect x="20" y="-6" width="24" height="12" fill="none" stroke="${B}" stroke-width="2"/></g>
    ${chip(160, 140, '⏱ signal delay', A, 112)}`),
  profile: svg('A rank insignia shield with chevrons and a star above an experience bar and four rank pips', `${sparks}
    <path d="M160 18l52 18v40c0 40-24 62-52 76-28-14-52-36-52-76V36z" fill="${F}" stroke="${B}" stroke-width="3"/>
    <path d="M132 86l28 16 28-16M132 104l28 16 28-16M132 122l28 16 28-16" fill="none" stroke="${A}" stroke-width="5" stroke-linejoin="round"/>${star(160, 58, 14, G)}
    <rect x="70" y="168" width="180" height="10" rx="5" fill="${T}"/><rect x="70" y="168" width="130" height="10" rx="5" fill="${B}"/>
    ${[0, 1, 2, 3].map(k => `<circle cx="${42 + k * 0}" cy="${46 + k * 30}" r="7" fill="${k < 3 ? G : 'none'}" stroke="${k < 3 ? G : S}" stroke-width="2"/>`).join('')}${chip(232, 30, 'RANK UP', B, 70)}`)
};
export const artFor = route => ART[route] || '';
