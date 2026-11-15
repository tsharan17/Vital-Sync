// Today's assessment: shown right after a check-in is saved.
import { IND, consultDays, sleepDebt, missionReadiness, clearance, quests, xpOf, rankOf, streakOf } from '../../engine/index.js';
import { gauge } from '../hud.js';
import { badgesHTML } from './profile.js';
import { todayISO } from '../../store.js';
import { esc, fmt, glyph, chip, check, reason, stepsFor, rank, forecastText, LV } from '../format.js';
import { chart, spark } from '../charts.js';
import { headline } from '../assess.js';

const FILL = ['var(--s0-fill)', 'var(--s1-fill)', 'var(--s2-fill)', 'var(--s3-fill)'];

export function view(ctx) {
  const { P, A, m, day, S } = ctx, last = P.log.find(e => e.d === day), prev = [...P.log].filter(e => e.d < day).reverse();
  const R = rank(A), top = R[0], l = top.level, today = last && last.date === todayISO();
  const rd = missionReadiness(A, P.log, day, P.cog), sd = sleepDebt(P.log, day), cl = clearance(l), qs = quests(P, day, !!last), xp = xpOf(P), rk = rankOf(xp.total), streak = streakOf(P.log, day);
  const sub = l ? reason(top) : 'Every reading is inside its range and no trend is heading for a limit. Keep the daily routine.';
  const saved = S.justSaved ? `<div class="saved" role="status"><span>${check}Day ${day} logged to ${esc(P.name)}'s record, +100 XP</span><span>${check}Compared with your personal baseline</span><span>${check}Forecasts updated for ${m.name}</span>${S.newBadges && S.newBadges.length ? `<span>${check}Achievement unlocked: ${S.newBadges.map(b => b.icon + ' ' + b.name).join(', ')}</span>` : ''}</div>` : '';
  const band = `<section class="band"><div class="wrap">
    <div class="frame"><div class="kicker">DAY ${String(day).padStart(3, '0')} CLEARANCE RESULT</div><div class="clear ${cl.code}">${cl.code === 'go' ? '✔' : cl.code === 'restrict' ? '▲' : '■'} ${cl.title}</div><div class="statusline"><span class="big" style="color:${FILL[l]}">${glyph(l, 64)}</span><div><h1>${headline(top, day)}</h1><p class="lede">${l ? `<b>${top.ind.name}.</b> ` : ''}${sub}</p></div></div>
    ${saved}
    <div class="facts"><span>Mission day<b>${day}${today ? ', today' : ''}</b></span><span>Mission readiness<b>${rd.score}%</b></span><span>Sleep debt, 7 nights<b>${sd.debt.toFixed(1)} h</b></span><span>Streak<b>${streak} days</b></span><span>${rk.name}<b>${xp.total.toLocaleString()} XP</b></span></div>
  </div></div></section>`;
  const changes = IND.map(i => {
    const a = A.find(x => x.ind.id === i.id), v = last && last.v[i.id], p = prev.find(e => e.v[i.id] != null);
    const d = v != null && p ? v - p.v[i.id] : null;
    const dt = v == null ? 'Not measured today' : d == null ? 'First reading' : Math.abs(d) < Math.pow(10, -i.dec) / 2 ? `Same as day ${p.d}` : `${d > 0 ? '▲' : '▼'} ${fmt(Math.abs(d), i)} since day ${p.d}`;
    return `<button class="chg s${a.level}" data-act="open" data-id="${i.id}"><span class="nm">${i.name}</span><span class="v num">${v == null ? '–' : fmt(v, i)} <small>${i.unit}</small></span><span class="d">${dt}</span>${chip(a.level)}</button>`;
  }).join('');
  const steps = l ? stepsFor(top) : ['Keep your check-in time the same each day', 'Hold the exercise target of 120 minutes', 'Protect your sleep period'];
  const tk = (P.taken[day] = P.taken[day] || {});
  const focus = l ? top : [...A].filter(a => !a.none).sort((x, y) => Math.abs(y.z || 0) - Math.abs(x.z || 0))[0];
  const action = `<section class="panel action s${l}"><div class="lbl">What to do now</div><h2>${glyph(l, 22)}<span class="s${l}">${LV[l]}</span></h2>
    ${top.onboard ? '<p class="note crit" style="margin-top:12px">Earth cannot help before the earliest forecast limit. Start the on-board steps now and send the report at once.</p>' : l >= 2 ? `<p class="note" style="margin-top:12px">Three message exchanges with flight surgeons take about ${(consultDays(m) * 24).toFixed(0)} hours from ${m.name.toLowerCase()}${S.blackout && m.black ? `, plus a ${m.black}-day communication blackout` : ''}.</p>` : ''}
    <ul class="plain" style="margin-top:14px">${steps.map(s => `<li><label class="chk"><input type="checkbox" data-take="${esc(s)}" data-day="${day}" ${tk[s] ? 'checked' : ''}><span>${s}</span></label></li>`).join('')}</ul>
    ${l ? `<p class="small soft" style="margin-top:12px">Tasks to protect: ${top.ind.tasks}.</p>` : ''}
    <p style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap">${l >= 2 ? '<a class="btn primary" href="#ground-link">Prepare report for flight surgeons</a>' : ''}<a class="btn" href="#body">Open body scan</a></p></section>`;
  const fc = focus ? `<section class="panel"><div class="lbl">Updated forecast</div><h2>${focus.ind.name}</h2><p class="soft" style="margin:6px 0 12px">${forecastText(focus)}</p>${chart(focus, day, { todayLabel: today ? 'today' : 'day ' + day })}</section>` : '';
  const minis = A.filter(a => !a.none && a !== focus).map(a => `<a class="panel mini" href="#trends"><span class="top"><span>${a.ind.name}</span>${chip(a.level)}</span>${spark(a, day)}<span class="small soft">${forecastText(a)}</span></a>`).join('');
  const questP = `<section class="panel br"><div class="lbl">Daily clearance quest</div><ul class="plain quest">${qs.map(q => `<li class="${q.done ? 'done' : ''}"><span class="box">${q.done ? '✓' : ''}</span><span>${q.name}${q.weekly ? ' <span class="small soft">(weekly)</span>' : ''}</span><span class="xp">${q.xp ? '+' + q.xp + ' XP' : ''}</span></li>`).join('')}</ul><p style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">${qs.find(q => q.id === 'cognitive' && !q.done) ? '<a class="btn" href="#cognitive">Run cognitive battery</a>' : ''}${qs.find(q => q.id === 'weekly' && !q.done) ? '<a class="btn" href="#protocol">Open weekly tasks</a>' : ''}</p></section>`;
  const rdP = `<section class="panel"><div class="lbl">Mission readiness</div>${gauge(rd)}<div class="xpbar" style="margin-top:16px"><i style="width:${(rk.progress * 100).toFixed(1)}%"></i></div><p class="small soft" style="margin-top:6px">${rk.name}${rk.next ? `, ${(rk.next.xp - xp.total).toLocaleString()} XP to ${rk.next.name}` : ''}</p></section>`;
  return band + `<div class="wrap page grid">
    <div class="grid two">${questP}${rdP}</div>
    <section><h2 style="margin-bottom:14px">What changed today</h2><div class="grid changes">${changes}</div></section>
    <div class="grid two">${action}${fc}</div>
    <section><h2 style="margin-bottom:14px">Your other trends</h2><div class="grid minis">${minis}</div></section>
    <section><div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:14px"><h2>Trophy room</h2><a href="#profile">Open crew record</a></div>${badgesHTML(P, day)}</section>
  </div>`;
}
