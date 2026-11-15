// All indicators with readings, baseline, limits and forecast.
import { chip, forecastText, rank } from '../format.js';
import { chart } from '../charts.js';

export function view(ctx) {
  const { A, day } = ctx;
  const band = `<section class="band"><div class="wrap"><h1>Trends and forecasts</h1><p class="lede">The last 60 days of every reading against your own baseline, and where each trend is heading.</p></div></section>`;
  return band + `<div class="wrap page grid two">${rank(A).filter(a => !a.none).map(a => `<section class="panel"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><h2>${a.ind.name}</h2>${chip(a.level)}</div><p class="soft" style="margin:6px 0 10px">${forecastText(a)}</p>${chart(a, day, { W: 620, H: 250, legend: false })}</section>`).join('')}</div>`;
}
