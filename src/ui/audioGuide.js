// Voice coach (speech synthesis) and hands-free logging (speech recognition).
// Speech recognition in Chrome and Edge sends audio to the browser maker's servers; it needs a network connection.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
const KEY = 'vital-sync-voice';
let on = (() => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } })();
let rec = null;
const SKEY = 'vital-sync-voice-set';
const vset = (() => { try { return Object.assign({ rate: 0.92, name: '' }, JSON.parse(localStorage.getItem(SKEY) || '{}')); } catch (e) { return { rate: 0.92, name: '' }; } })();
let volume = () => 0.8;
export function linkVolume(fn) { volume = fn; }
const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export const voice = {
  get on() { return on; },
  set(b) { on = !!b; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (!on) this.hush(); },
  canSpeak: typeof window !== 'undefined' && 'speechSynthesis' in window,
  canListen: !!SR,
  get settings() { return { ...vset }; },
  setSettings(o) { Object.assign(vset, o); try { localStorage.setItem(SKEY, JSON.stringify(vset)); } catch (e) {} },
  voices() { try { return speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); } catch (e) { return []; } },
  pick() {
    const all = this.voices();
    return all.find(v => v.name === vset.name) || all.find(x => /en(-|_)(US|GB)/.test(x.lang) && /female|samantha|serena|google uk english female|aria|jenny/i.test(x.name)) || all[0] || null;
  },
  utter(text) {
    const u = new SpeechSynthesisUtterance(text); u.rate = vset.rate; u.pitch = 0.95; u.volume = Math.max(0.05, volume());
    const v = this.pick(); if (v) u.voice = v; return u;
  },
  say(text, force = false) {
    if ((!on && !force) || !this.canSpeak) return;
    try { player.stop(); speechSynthesis.cancel(); speechSynthesis.speak(this.utter(text)); } catch (e) { /* speech blocked: stay silent */ }
  },
  // Compatibility wrappers: narration now runs through the player below.
  sayQueue(lines, o = {}) { player.play(o.title || 'Voice guide', lines); },
  stopQueue() { player.stop(); },
  get speaking() { return player.st.status !== 'idle'; },
  hush() { player.stop(); try { speechSynthesis.cancel(); } catch (e) {} },
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
// Free-form phrase to a named reading: "pulse sixty-eight", "SpO2 ninety-eight percent", "one twenty over eighty".
export function parseAny(text) {
  const t = String(text).toLowerCase(), n = wordsToNumbers(t.replace(/\bsp\s*o\s*2\b|\bspo2\b|\bsp02\b/g, ' spo '));
  if (!n.length) return null;
  const last = n[n.length - 1];
  if (/\bover\b|\//.test(t) && n.length >= 2) return { sys: n[n.length - 2], dia: last };
  if (/\bspo\b|sp\s*o\s*2|oxygen|saturation|\bsat\b/.test(t)) return { spo2: last };
  if (/pulse|heart|\bbpm\b|beats/.test(t)) return { hr: last };
  if (/breath|respirat/.test(t)) return { rr: last };
  if (/sugar|glucose/.test(t)) return { glu: last };
  if (/temp|degree|celsius/.test(t) || (last >= 34 && last <= 42 && !Number.isInteger(last))) return { temp: last };
  if (/sleep|hours? of/.test(t)) return { sleep: last };
  if (/percent|%/.test(t) && last >= 70 && last <= 100) return { spo2: last };
  return null;
}

// Narration player: one shared player with play, pause, resume, repeat and stop, shown in the audio dock.
// Lines are strings or { text, pause, phase, head }. Pausing cancels the current line; resuming replays it from its start.
const lineText = l => typeof l === 'object' ? l.text || '' : l;
let tok = 0, timer = null;
export const player = {
  st: { title: '', lines: [], i: 0, status: 'idle' },
  subs: new Set(),
  on(fn) { this.subs.add(fn); return () => this.subs.delete(fn); },
  emit() { for (const f of this.subs) { try { f(this.st); } catch (e) {} } },
  get line() { return this.st.lines[this.st.i]; },
  play(title, lines, at = 0) {
    this._cut(); this.st = { title, lines, i: Math.max(0, Math.min(at, lines.length - 1)), status: 'playing' }; this._speak();
  },
  pause() { if (this.st.status !== 'playing') return; this._cut(); this.st.status = 'paused'; this.emit(); },
  resume() { if (this.st.status !== 'paused') return; this.st.status = 'playing'; this._speak(); },
  toggle() { this.st.status === 'playing' ? this.pause() : this.st.status === 'paused' ? this.resume() : this.st.lines.length && this.play(this.st.title, this.st.lines); },
  repeat() { if (this.st.lines.length) this.play(this.st.title, this.st.lines, 0); },
  back() { if (this.st.lines.length) this.play(this.st.title, this.st.lines, this.st.i - 1); },
  next() { if (this.st.lines.length && this.st.i < this.st.lines.length - 1) this.play(this.st.title, this.st.lines, this.st.i + 1); },
  stop() { if (this.st.status === 'idle') return; this._cut(); this.st = { ...this.st, status: 'idle' }; this.emit(); },
  _cut() { tok++; clearTimeout(timer); try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch (e) {} },
  _speak() {
    const my = ++tok, line = this.line, text = lineText(line), wait = typeof line === 'object' ? line.pause || 0 : 0;
    this.emit();
    const advance = () => {
      if (my !== tok) return; clearTimeout(timer);
      timer = setTimeout(() => {
        if (my !== tok) return;
        if (this.st.i >= this.st.lines.length - 1) { this.st = { ...this.st, status: 'idle', done: true }; this.emit(); return; }
        this.st.i++; this._speak();
      }, 650 + wait);
    };
    if (!text || !voice.canSpeak) { timer = setTimeout(advance, text ? 900 + text.length * 55 : 0); return; }
    let fired = false; const fin = () => { if (fired) return; fired = true; advance(); };
    try { const u = voice.utter(text); u.onend = fin; u.onerror = fin; speechSynthesis.speak(u); } catch (e) { fin(); return; }
    // Some browsers drop the end event: fall back to a generous length-based estimate.
    timer = setTimeout(() => { if (my === tok) fin(); }, 2000 + text.length * 100 / (voice.settings.rate || 1));
  }
};
