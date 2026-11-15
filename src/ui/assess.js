// Combines indicator analyses into region states and headlines for the screens.
import { immune, radiation, bone } from '../engine/index.js';

export function regionLevels(A, P, day, m) {
  const lv = r => Math.max(0, ...A.filter(a => a.ind.region === r).map(a => a.level));
  const im = immune(P.log, day, A), rad = radiation(day, m), bn = bone(P.log, day);
  return {
    head: lv('head'), chest: lv('chest'), core: Math.max(lv('core'), im.state === 2 ? 1 : 0),
    legs: bn.adh < 0.6 ? 2 : bn.adh < 0.8 ? 1 : 0, halo: rad.projPct > 1 ? 2 : rad.projPct > 0.8 ? 1 : 0
  };
}
export function headline(top, day) {
  const n = top.ind.name.toLowerCase();
  return [`All clear for day ${day}.`, `Keep an eye on your ${n}.`, 'Tell your crew medical officer today.', 'Contact flight surgeons now.'][top.level];
}
