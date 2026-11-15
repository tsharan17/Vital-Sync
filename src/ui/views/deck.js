// Mission deck: illustrated cards for every other station, each with a live game-style status.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { xpOf, rankOf, cabinTelemetry } from '../../engine/index.js';
import { artFor } from '../art.js';
import { dueCount } from './protocol.js';

export function deck(ctx) {
  const { P, A, m, lastDay: day } = ctx, live = A.filter(a => !a.none), has = P.log.length > 0;
  const top = live.reduce((x, a) => Math.max(x, a.level), 0), drifting = live.filter(a => a.drift >= 1).length;
  const x = xpOf(P), rk = rankOf(x.total);
  const lastCog = (P.cog || []).filter(c => c.d > day - 7).slice(-1)[0];
  const due = dueCount(P, day), cab = cabinTelemetry(day || 1, m), cabTop = Math.max(...Object.values(cab.levels));
  const cards = [
    ['check-in', 'Clearance', 'Update today’s tests or redo a reading.', [has ? 'Logged today' : 'Start here', has ? 0 : 2]],
    ['body', 'Body scan', 'Rotate the hologram and zoom into any region.', has ? [top >= 1 ? `${live.filter(a => a.level >= 1).length} to watch` : 'All regions nominal', top >= 2 ? 2 : top] : ['No scan yet', 1]],
    ['trends', 'Trends', 'See drift early and when a limit could be crossed.', has ? [drifting ? `${drifting} drifting` : 'All steady', drifting ? 2 : 0] : ['Needs readings', 1]],
    ['cognitive', 'Cognitive', 'Reaction, memory and tracking mini-games.', lastCog ? [`Score ${lastCog.score} this week`, 0] : ['Due · +75 XP', 2]],
    ['protocol', 'Protocol', 'Weekly vision, strength, balance and more.', due ? [`${due} task${due > 1 ? 's' : ''} due`, 2] : ['All caught up', 0]],
    ['systems', 'Systems', 'Sleep debt, radiation and cabin air.', [cab.flare ? 'Solar flare: shelter' : cabTop ? 'Cabin air: check' : 'Cabin nominal', cab.flare ? 3 : cabTop ? 2 : 0]],
    ['ground-link', 'Ground link', 'A ready-to-send report for flight surgeons.', [m.oneWayS < 60 ? 'Live link' : `${Math.round(m.oneWayS / 60)} min delay`, 0]],
    ['profile', 'Crew', 'Rank, trophy room and pre-flight baseline.', [rk.next ? `${(rk.next.xp - x.total).toLocaleString()} XP to ${rk.next.name}` : `${rk.name} · max rank`, 0]]
  ];
  return `<section class="deck" aria-labelledby="deck-h"><div class="deckhead"><h2 id="deck-h" tabindex="-1">Mission deck</h2><p class="soft">Your clearance is in. Here is every station, and what is waiting at each one.</p></div>
    <div class="deckgrid">${cards.map(([id, t, d, [st, l]]) => `<a class="deckcard" href="#${id}"><div class="deckart">${artFor(id)}</div><div class="deckbody"><b>${t}</b><span class="soft small">${d}</span><span class="chip s${l}">${st}</span></div></a>`).join('')}</div></section>`;
}
