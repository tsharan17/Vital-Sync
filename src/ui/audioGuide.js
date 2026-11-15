// Voice coach (speech synthesis) and hands-free logging (speech recognition).
// Speech recognition in Chrome and Edge sends audio to the browser maker's servers; it needs a network connection.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
const KEY = 'vital-sync-voice';
let on = (() => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } })();
let rec = null;
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export const voice = {
  get on() { return on; },
  set(b) { on = !!b; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (!on) this.hush(); },
  canSpeak: typeof window !== 'undefined' && 'speechSynthesis' in window,
  canListen: !!SR,
  say(text, force = false) {
    if ((!on && !force) || !this.canSpeak) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.rate = 0.92; u.pitch = 0.95;
      const v = speechSynthesis.getVoices().find(x => /en(-|_)(US|GB)/.test(x.lang) && /female|samantha|serena|google uk english female|aria|jenny/i.test(x.name)) || speechSynthesis.getVoices().find(x => /^en/.test(x.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* speech blocked: stay silent */ }
  },
  hush() { try { speechSynthesis.cancel(); } catch (e) {} },
  listen(onText, onEnd) {
    if (!SR) { onEnd && onEnd('unsupported'); return; }
    this.stop();
    try {
      rec = new SR(); rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 3; rec.continuous = false;
      rec.onresult = e => { const alts = [...e.results[0]].map(r => r.transcript); onText(alts); };
      rec.onerror = e => { onEnd && onEnd(e.error || 'error'); };
      rec.onend = () => { rec = null; onEnd && onEnd('end'); };
      rec.start();
    } catch (e) { rec = null; onEnd && onEnd('error'); }
  },
  stop() { try { rec && rec.stop(); } catch (e) {} rec = null; },
  get listening() { return !!rec; }
};

// Spoken numbers: "seventy two", "one eighteen over seventy six", "thirty six point eight", "ninety nine".
const ONES = { zero: 0, oh: 0, o: 0, one: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5, six: 6, seven: 7, eight: 8, ate: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
export function wordsToNumbers(text) {
  const toks = String(text).toLowerCase().replace(/(\d)\s*\/\s*(\d)/g, '$1 over $2').replace(/-/g, ' ').replace(/[^a-z0-9. ]/g, ' ').split(/\s+/).filter(Boolean);
  const out = []; let cur = null, dec = null;
  const flush = () => { if (cur != null) out.push(dec ? +(cur + '.' + dec) : cur); cur = null; dec = null; };
  for (const t of toks) {
    if (/^\d+(\.\d+)?$/.test(t)) { flush(); out.push(+t); continue; }
    if (t === 'point' && cur != null) { dec = ''; continue; }
    if (dec !== null) { if (ONES[t] != null && ONES[t] < 10) { dec += ONES[t]; continue; } flush(); }
    if (t === 'hundred') { cur = (cur || 1) * 100; continue; }
    if (TENS[t] != null) {
      const v = TENS[t];
      if (cur == null) cur = v; else if (cur >= 100 && cur % 100 === 0) cur += v; else if (cur < 10) cur = cur * 100 + v; else { flush(); cur = v; }
      continue;
    }
    if (ONES[t] != null && !(['o', 'to', 'too', 'for', 'ate'].includes(t) && cur == null)) {
      const v = ONES[t];
      if (cur == null) cur = v;
      else if (cur >= 20 && cur % 10 === 0 && v < 10 && cur % 100 !== 0) cur += v;
      else if (cur >= 100 && cur % 100 === 0) cur += v;
      else if (cur >= 100 && cur % 10 === 0 && v < 10) cur += v;
      else if (cur < 10 && v >= 10) cur = cur * 100 + v;
      else { flush(); cur = v; }
      continue;
    }
    flush();
  }
  flush();
  return out;
}
// Returns the readings found for a check-in step, or null.
export function parseSpoken(alts, step) {
  for (const text of [].concat(alts)) {
    const n = wordsToNumbers(text);
    if (step === 'bp') { if (n.length >= 2) return { sys: n[0], dia: n[1] }; continue; }
    if (n.length >= 1) return { [step]: n[n.length - 1] };
  }
  return null;
}
