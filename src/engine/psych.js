// Vital Sync engine. Pure functions, no DOM.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
// Weekly wellbeing check built from two published, validated short scales:
//  - Perceived Stress Scale, 4-item version (PSS-4). Cohen, Kamarck and Mermelstein, J Health Soc Behav 1983;24:385-396.
//    Free for academic and non-profit use. Items 2 and 3 are reverse scored. Range 0 to 16; higher means more perceived stress.
//  - Three-Item Loneliness Scale. Hughes, Waite, Hawkley and Cacioppo, Research on Aging 2004;26:655-672.
//    Range 3 to 9; scores of 6 or more are commonly used in research to identify loneliness.
// The PSS-4 is normally asked about "the last month"; Vital Sync asks it weekly about "the last week", a common adaptation
// that should be noted when interpreting scores. Neither scale is a diagnosis.
export const PSS4 = [
  { t: 'In the last week, how often have you felt that you were unable to control the important things in your life?', rev: false },
  { t: 'In the last week, how often have you felt confident about your ability to handle your personal problems?', rev: true },
  { t: 'In the last week, how often have you felt that things were going your way?', rev: true },
  { t: 'In the last week, how often have you felt difficulties were piling up so high that you could not overcome them?', rev: false }
];
export const PSS_OPTS = ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'];
export const LONELY3 = ['How often do you feel that you lack companionship?', 'How often do you feel left out?', 'How often do you feel isolated from others?'];
export const LONELY_OPTS = ['Hardly ever', 'Some of the time', 'Often'];
export const CONFINE = 'How much is living in a small, closed space wearing on you today? (1 not at all, 5 a lot; a Vital Sync item, not part of a validated scale)';

export function pss4(ans) {
  if (!Array.isArray(ans) || ans.length !== 4 || ans.some(x => !(x >= 0 && x <= 4))) return null;
  return ans.reduce((s, x, k) => s + (PSS4[k].rev ? 4 - x : x), 0);
}
export function lonely3(ans) {
  if (!Array.isArray(ans) || ans.length !== 3 || ans.some(x => !(x >= 1 && x <= 3))) return null;
  return ans.reduce((s, x) => s + x, 0);
}
// Map to the 1-to-5 stress and isolation fields used by the rest of the app and the ground report.
export const stressLevel = p => p == null ? null : 1 + Math.round(p / 16 * 4);
export const isolationLevel = l => l == null ? null : 1 + Math.round((l - 3) / 6 * 4);
export function psychDue(log, day) { return !(log || []).some(e => e.q && e.q.pss4 != null && e.d > day - 7); }
export function psychNote(p, l, prev) {
  const out = [];
  if (l != null && l >= 6) out.push('Your loneliness score is in the range research uses to identify loneliness.');
  if (p != null && prev != null && p - prev >= 4) out.push('Your perceived stress is clearly higher than last week.');
  return out;
}
