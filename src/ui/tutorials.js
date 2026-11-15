// Clinical technique guides: an annotated line diagram per instrument (public/assets/guides, drawn by
// scripts/make-guides.py) beside the step-by-step instructions, with a button to hear the steps read aloud.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
export const GUIDES = {
  cuff: { file: 'bp-cuff-guide.svg', title: 'Blood pressure cuff', alt: 'A seated astronaut with back supported, feet flat and forearm resting palm up on a table. The cuff is on the bare upper arm at heart level. A close-up shows the cuff’s lower edge 2 to 3 cm above the elbow crease, with its artery marker over the brachial artery on the inner arm.' },
  pulse: { file: 'pulse-wrist-guide.svg', title: 'Radial pulse', alt: 'An upturned forearm and hand. Two fingertips of the other hand rest just above the wrist crease on the thumb side, over the radial artery, which is drawn in red.' },
  oxi: { file: 'spo2-finger-guide.svg', title: 'Pulse oximeter', alt: 'A hand resting flat with the index finger pushed fully into a clip oximeter, nail facing up toward the light. The display shows 98 percent and a steady pulse wave.' },
  thermo: { file: 'temp-ear-guide.svg', title: 'Thermometer', alt: 'Two head profiles. Left: a forehead thermometer starts mid-forehead and sweeps across to the hairline at the temple. Right: the ear is pulled up and back while an ear thermometer probe enters the ear canal.' },
  lancet: { file: 'glucose-lancet-guide.svg', title: 'Glucose lancet', alt: 'Four panels: wash and dry the hands; lance the side of the fingertip, not the pad; wipe away the first drop; touch the next drop to the edge of the test strip in the meter.' },
  lungs: { file: 'respiratory-guide.svg', title: 'Breathing count', alt: 'A seated person with a hand on the belly, arrows showing the chest rise and fall, beside a 60-second breathing trace with one dot per breath: 14 breaths in 60 seconds.' }
};
export const guideSrc = key => GUIDES[key] ? `./assets/guides/${GUIDES[key].file}` : '';
export function guideImg(key) {
  const g = GUIDES[key]; if (!g) return '';
  return `<a class="guideimg" href="${guideSrc(key)}" target="_blank" rel="noopener" title="Open the full-size guide"><img src="${guideSrc(key)}" alt="${g.alt}" width="720" height="460" loading="lazy" decoding="async"></a>`;
}
export function tutorial(ind, button = true) {
  if (!ind.tool || !ind.tut) return '';
  return `<div class="tut">${guideImg(ind.tool)}<div><div class="lbl">Technique guide</div><ol>${ind.tut.map(t => `<li>${t}</li>`).join('')}</ol>
    ${button ? `<p style="margin-top:12px"><button class="btn" data-act="guide-say" data-id="${ind.id}" style="min-height:40px;padding:8px 14px;font-size:14px">🔊 Listen to guide</button></p>` : ''}</div></div>`;
}
