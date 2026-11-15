// Vital Sync engine. Pure functions, no DOM.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
// Cognitive battery scoring: psychomotor vigilance (PVT), spatial memory sequence and motor tracking.

export const PVT_LAPSE_MS = 500, PVT_FATIGUE_MS = 320, PVT_ACE_MS = 250;
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

// rts: reaction times in ms for valid responses; falseStarts: taps before the stimulus.
export function pvtStats(rts, falseStarts = 0) {
  const valid = rts.filter(x => x >= 100), med = median(valid), lapses = valid.filter(x => x >= PVT_LAPSE_MS).length;
  const score = med == null ? 0 : clamp(100 - Math.max(0, med - 220) * 0.4 - lapses * 6 - falseStarts * 4);
  return { n: valid.length, median: med, lapses, falseStarts, fatigued: med != null && med > PVT_FATIGUE_MS, score: Math.round(score) };
}
// level: longest sequence repeated correctly (the test starts at 3 and stops at 9).
export const memoryScore = level => Math.round(clamp((level - 2) / 7 * 100));
// onTarget: fraction of samples where the reticle stayed on the target (0 to 1).
export const trackingScore = onTarget => Math.round(clamp(onTarget * 100));
export function cognitiveScore({ pvt, memory, tracking }) {
  const parts = [[pvt, 0.4], [memory, 0.3], [tracking, 0.3]].filter(p => p[0] != null);
  if (!parts.length) return null;
  const w = parts.reduce((s, p) => s + p[1], 0);
  return Math.round(parts.reduce((s, p) => s + p[0] * p[1], 0) / w);
}
