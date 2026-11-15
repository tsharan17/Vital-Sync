// Sound, voice and display settings, shown on the Crew screen.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { esc } from '../format.js';
import { voice } from '../audioGuide.js';
import { getVolume, isMuted } from '../soundFx.js';
import { THEMES, themePref } from '../theme.js';

export function settingsHTML() {
  const set = voice.settings, vs = voice.voices(), cur = voice.pick();
  return `<section class="panel br" id="settings"><div class="lbl">Sound, voice and display</div><h2 style="margin-bottom:6px">Settings</h2>
    <p class="soft" style="margin-bottom:16px">Every screen can read itself aloud: look for 🔊 Listen buttons. The player that appears lets you pause, play, repeat and skip.</p>
    <div class="setgrid">
      <label for="vol">Master volume <output id="volo">${Math.round(getVolume() * 100)}%</output></label><input type="range" id="vol" min="0" max="100" step="5" value="${Math.round(getVolume() * 100)}">
      <label for="vrate">Speaking rate <output id="vrateo">${(+set.rate).toFixed(2)}×</output></label><input type="range" id="vrate" min="0.75" max="1.25" step="0.05" value="${Math.min(1.25, Math.max(0.75, set.rate))}">
      ${vs.length ? `<label for="vname">Voice</label><select id="vname" class="field">${vs.map(v => `<option value="${esc(v.name)}" ${cur && cur.name === v.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select>` : `<span>Voice</span><span class="small soft">${voice.canSpeak ? 'Voices are still loading; reopen this page in a moment.' : 'This browser has no speech output; captions are shown instead.'}</span>`}
      <label for="theme">Theme</label><select id="theme" class="field">${THEMES.map(([k, t]) => `<option value="${k}" ${themePref() === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><button class="tog" data-act="snd" aria-pressed="${!isMuted()}">${isMuted() ? 'Sound effects muted' : 'Sound effects on'}</button><button class="tog" data-act="vc" aria-pressed="${voice.on}">${voice.on ? 'Voice coach on' : 'Voice coach off'}</button><button class="btn" data-act="au-vtest" style="min-height:40px;padding:8px 14px">🔊 Test voice</button></div>
    <div class="lbl" style="margin-top:20px">Sound check</div><div class="quick">${[['blip', 'Blip'], ['tick', 'Tick'], ['chime', 'Chime'], ['bell', 'Bell'], ['fanfare', 'Fanfare'], ['klaxon', 'Alert klaxon']].map(([k, t]) => `<button data-act="au-sfx" data-s="${k}">${t}</button>`).join('')}</div>
    <p class="small soft" style="margin-top:12px">${isMuted() ? 'Sound effects are muted, so the sound check is silent. ' : ''}All sounds are generated in the browser; there are no audio files. Voice uses your device's built-in speech. The voice coach speaks each check-in step automatically when it is on.</p></section>`;
}
