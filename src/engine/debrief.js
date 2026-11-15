// Vital Sync engine. Pure functions, no DOM.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
// Spoken flight-surgeon style debrief built from today's assessment. Returns plain sentences for speech and captions.
const TITLE = { 'Flight Cadet': 'Cadet', 'Specialist': 'Specialist', 'Science Officer': 'Officer', 'Mission Commander': 'Commander' };
const say = (x, dec = 0) => {
  const r = (+x).toFixed(dec);
  return r.endsWith('.0') ? r.slice(0, -2) : r;
};
export function greeting(hour) { return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'; }

export function debrief({ rankName = 'Flight Cadet', hour = 9, A = [], readiness = null, day = null }) {
  const by = id => A.find(a => a.ind && a.ind.id === id && !a.none);
  const lines = [`${greeting(hour)}, ${TITLE[rankName] || 'crew member'}.${day ? ` This is your mission day ${day} health debrief.` : ''}`];
  const live = A.filter(a => !a.none);
  if (!live.length) { lines.push('There are no readings yet. Complete your daily clearance to get a debrief.'); return lines; }
  const top = live.reduce((m, a) => Math.max(m, a.level), 0);
  lines.push(['All systems are nominal today.', 'All systems are nominal, with one reading on watch.', 'Some readings need attention today.', 'At least one reading is in the alert range.'][top]);
  const parts = [], hr = by('hr'), sys = by('sys'), dia = by('dia'), spo2 = by('spo2'), temp = by('temp'), rr = by('rr');
  if (hr) parts.push(`resting heart rate is ${say(hr.val)} beats per minute`);
  if (sys && dia) parts.push(`blood pressure is ${say(sys.val)} over ${say(dia.val)}`);
  if (spo2) parts.push(`blood oxygen is ${say(spo2.val)} percent`);
  if (rr) parts.push(`breathing rate is ${say(rr.val)} breaths a minute`);
  if (temp) parts.push(`temperature is ${say(temp.val, 1)} degrees`);
  if (parts.length) lines.push(`Your ${parts.length > 1 ? parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1] : parts[0]}.`);
  const drifting = live.filter(a => a.drift >= 1).sort((x, y) => y.level - x.level);
  if (!drifting.length) lines.push('No trend drift detected.');
  else lines.push(drifting.slice(0, 2).map(a => `${a.ind.name} is drifting ${a.fit && a.fit.b > 0 ? 'upward' : 'downward'} from your baseline`).join('. ') + '.');
  if (readiness && readiness.score != null) lines.push(`Mission readiness is ${readiness.score} percent.`);
  lines.push(['You are cleared for duty.', 'You are cleared for duty. Keep an eye on the item on watch.', 'You are cleared with restrictions. Tell your crew medical officer today.', 'You are not cleared. Contact flight surgeons now.'][top]);
  return lines;
}
