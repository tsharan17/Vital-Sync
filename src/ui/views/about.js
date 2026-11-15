// How Vital Sync works, the challenge resources it uses, evidence, and AI use.
import { IND, MODES, R, consultDays } from '../../engine/index.js';
import { dur } from '../format.js';

const row = (t, u, n) => `<tr><td><a href="${u}">${t}</a></td><td>${n}</td></tr>`;

export function view() {
  const band = `<section class="band"><div class="wrap"><div class="frame"><div class="kicker">MISSION BRIEFING</div><h1>Catch it before it's urgent.</h1><p class="lede">Vital Sync helps an astronaut with no medical training notice slow, silent changes in their own body and decide what to do when Earth is too far away to answer in time.</p></div></div></section>`;
  return band + `<div class="wrap page grid">
  <section class="panel"><h2>How the lead-time margin works</h2><ol class="grid how" style="margin-top:22px">
    <li><h3>Learn your normal</h3><p>After the first two weeks of adaptation, the app builds your personal baseline from your own readings.</p></li>
    <li><h3>Spot the drift</h3><p>It fits a trend to recent readings and flags a steady shift away from your baseline, even while every value is still in range.</p></li>
    <li><h3>Forecast the limit</h3><p>It estimates how many days remain before the reading crosses a caution or alert limit, with an uncertainty range.</p></li>
    <li><h3>Weigh it against Earth</h3><p>It compares that time with how long help from Earth takes at your current distance, and escalates when the margin runs out.</p></li>
  </ol></section>
  <section class="panel"><h2>Distance changes the answer</h2><p class="soft" style="margin:6px 0 14px">The same drift is handled on board earlier when Earth is further away.</p><div class="scroll"><table><thead><tr><th>Location</th><th>Autonomy level</th><th>One-way signal</th><th>Three exchanges with ground</th><th>If things get worse</th></tr></thead><tbody>${MODES.map(m => `<tr><td>${m.name}</td><td class="num">${m.lv}</td><td class="num">${dur(m.oneWayS)}</td><td class="num">${(consultDays(m) * 24).toFixed(1)} h</td><td>${m.evac}</td></tr>`).join('')}</tbody></table></div></section>
  <section class="panel"><h2>Challenge resources and how Vital Sync uses them</h2><div class="scroll" style="margin-top:12px"><table><thead><tr><th>Resource</th><th>Used for</th></tr></thead><tbody>
    ${row('NASA: 5 Hazards of Human Spaceflight', 'https://www.nasa.gov/hrp/hazards/', 'Hazard links on every reading; distance and gravity in each location')}
    ${row('NASA: Risks of Human Spaceflight', 'https://www.nasa.gov/hrp/risks/', 'The NASA risk each reading informs, linked on every detail card')}
    ${row('NASA: Ongoing HRP Research', 'https://www.nasa.gov/hrp/ongoing-hrp-research/', 'Daily standard-measures check-in, sleep debt, immune window, exercise log')}
    ${row('CSA: Monitoring Radiation for Astronaut Health', 'https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp', 'Radiation passport and the neutron note')}
    ${row('CSA: Why Do We Conduct Science Experiments in Space?', 'https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp', 'Communication delay reasoning and the benefit on Earth')}
  </tbody></table></div></section>
  <section class="panel"><h2>Evidence and methods</h2><div class="scroll" style="margin-top:12px"><table><thead><tr><th>Source</th><th>Used for</th></tr></thead><tbody>
    ${row('NASA: Risk of Spaceflight-Induced Bone Changes', R + 'risk-of-spaceflight-induced-bone-changes/', '1% to 1.5% bone loss a month')}
    ${row('Barger et al., The Lancet Neurology, 2014', 'https://doi.org/10.1016/S1474-4422(14)70122-X', 'Crews sleep about 6 hours when 8.5 are scheduled')}
    ${row('Mishra et al., Nature Biomedical Engineering, 2020', 'https://www.nature.com/articles/s41551-020-00640-6', 'Personal-baseline detection and two-tier alerts')}
    ${row('Riccalton et al., BMC Medicine, 2025', 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11899892/', 'Adding trends to snapshot warning scores')}
    ${row('Cypko et al., SpaceCHI, 2025', 'https://drops.dagstuhl.de/entities/document/10.4230/OASIcs.SpaceCHI.2025.33', 'Four autonomy levels by mission distance')}
    ${row('CSA Connected Care Medical Module framework, SpaceOps 2025', 'https://publications.spaceops.org/2025/download_by_id.php?id=0092', 'Mars signal delay of up to 20 minutes one way')}
    ${row('NASA IMPACT 1.0 Task Impairment', 'https://ntrs.nasa.gov/citations/20210021153', 'Showing health in terms of mission tasks')}
    ${row('NASA space radiation standard paper', 'https://ntrs.nasa.gov/api/citations/20250006168/downloads/ASCEND%20Simonsen%20draft%201.pdf', '600 mSv career limit')}
    ${IND.filter((i, k, a) => a.findIndex(j => j.src[1] === i.src[1]) === k).map(i => row(i.src[0], i.src[1], 'Reference range, draft')).join('')}
  </tbody></table></div></section>
  <div class="grid two">
    <section class="panel tint"><h2>What Vital Sync is not</h2><p style="margin-top:8px">It is decision support, not a diagnosis, and not a medical device. Reference ranges are draft values from general clinical sources for healthy adults on Earth and must be reviewed by a clinician before real use. Models marked as estimates are simplifications.</p></section>
    <section class="panel tint"><h2>Use of AI tools</h2><p style="margin-top:8px">The code was generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team. Research summaries were prepared with the same tool and checked against the linked sources. No AI-generated images, audio or video are used, and no NASA logos or mission identifiers appear.</p></section>
  </div>
  <section class="panel"><h2>Team V-Sync</h2><p style="margin-top:8px">Sharan and Vedanti, VNR VJIET. Built for the NASA Space Apps Challenge 2026: Create Health Monitoring Software for Astronauts on Space Missions.</p></section>
  </div>`;
}
