// Crew profile: rank and XP, trophy room, and personal baselines.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { IND, xpOf, rankOf, achievements, XP, RANKS } from '../../engine/index.js';
import { esc, fmt } from '../format.js';

export const badgesHTML = (P, day) => `<div class="badges">${achievements(P, day).map(b => `<div class="badge ${b.unlocked ? 'got' : 'locked'}"><div class="ic" aria-hidden="true">${b.icon}</div><b>${b.name}</b><span>${b.unlocked ? 'Unlocked' : 'Locked'}: ${b.how}</span></div>`).join('')}</div>`;

export function view(ctx) {
  const { P, A, day, db, S } = ctx, x = xpOf(P), r = rankOf(x.total);
  const band = `<section class="band"><div class="wrap"><div class="frame"><div class="kicker">CREW RECORD · ${esc(P.name.toUpperCase())}</div><h1>${r.name}</h1><p class="lede">${x.total.toLocaleString()} XP. ${r.next ? `${(r.next.xp - x.total).toLocaleString()} XP to ${r.next.name}.` : 'Highest rank reached.'}</p><div class="xpbar" style="margin-top:18px;max-width:560px;height:10px"><i style="width:${(r.progress * 100).toFixed(1)}%"></i></div>
    <div class="facts"><span>Check-ins<b>${x.checkins} × ${XP.checkin}</b></span><span>Exercise targets met<b>${x.exercise} × ${XP.exercise}</b></span><span>Weekly cognitive batteries<b>${x.cogWeeks} × ${XP.cognitive}</b></span></div></div></div></section>`;
  const rows = IND.map(i => { const a = A.find(y => y.ind.id === i.id), pb = (P.baseline || {})[i.id]; return `<tr><td>${i.name}</td><td class="num">${a && !a.none && !a.provisional && !a.preflight ? `${fmt(a.bm, i)} ± ${a.bsd.toFixed(Math.max(1, i.dec))}` : '<span class="soft">forming</span>'}</td><td><input class="field" id="pb-m-${i.id}" type="number" step="${i.step}" value="${pb ? pb.m : ''}" aria-label="${esc(i.name)} pre-flight mean" style="width:110px"></td><td><input class="field" id="pb-s-${i.id}" type="number" step="${i.step}" min="0" value="${pb ? pb.s : ''}" aria-label="${esc(i.name)} pre-flight spread" style="width:100px"></td><td class="small soft">${i.unit}</td></tr>`; }).join('');
  return band + `<div class="wrap page grid">
  <section><h2 style="margin-bottom:12px">Trophy room</h2>${badgesHTML(P, day)}</section>
  <section class="panel"><h2>Ranks</h2><ul class="plain duelist" style="margin-top:12px">${RANKS.map((k, i) => `<li><span>${i <= r.index ? '★' : '☆'} ${k.name}</span><span class="num">${k.xp.toLocaleString()} XP</span></li>`).join('')}</ul></section>
  <section class="panel"><h2>Personal baseline</h2><p class="soft" style="margin:6px 0 14px;max-width:80ch">Vital Sync learns your normal from your own readings after the ${14}-day adaptation window. If the flight surgeon has verified pre-flight values, enter them here and they are used instead. Readings are then judged against you: within 1.5 standard deviations of your mean is normal for you, 1.5 to 2.5 is watch, beyond that tell the crew medical officer. Population alert limits always still apply.</p>
    <div class="scroll"><table><thead><tr><th>Reading</th><th>Learned baseline</th><th>Pre-flight mean</th><th>Pre-flight spread (1 sd)</th><th>Unit</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap"><button class="btn primary" data-act="pb-save">Save pre-flight baseline</button><button class="btn" data-act="pb-clear">Clear and learn automatically</button></p>${S.msg ? `<p class="note info" style="margin-top:12px">${esc(S.msg)}</p>` : ''}</section>
  <section class="panel"><h2>Crew on this device</h2><ul class="plain" style="margin:12px 0 16px">${db.profiles.map(p => `<li>${esc(p.name)}${p.demo ? ' <span class="small soft">(simulated history)</span>' : ''}: ${p.log.length} days logged, ${rankOf(xpOf(p).total).name}</li>`).join('')}</ul><div class="rowf"><label for="newname">Add a crew member<input class="field" id="newname" maxlength="40" placeholder="Name or call sign"></label><button class="btn" data-act="crew-add">Add and start clearance</button></div></section>
  </div>`;
}
