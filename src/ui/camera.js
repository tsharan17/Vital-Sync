// Camera input for protocol tasks: take a photo with the device camera or attach an image file.
// Photos are downscaled to small JPEGs and kept on this device only. For the hydration check, the average colour
// of the centre of the photo is matched to the urine chart to suggest a shade, which the astronaut confirms.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import { nearestSwatch, URINE_CHART } from '../engine/index.js';
import { sfx } from './soundFx.js';

export const PH = { hydration: null, ultrasound: null, suggest: null, msg: '' };
const MAX = 480, Q = 0.72;
export const MAX_PHOTOS = 8;

function shrink(src) {
  const w = src.videoWidth || src.naturalWidth || src.width, h = src.videoHeight || src.naturalHeight || src.height;
  const k = Math.min(1, MAX / Math.max(w, h)), c = document.createElement('canvas');
  c.width = Math.round(w * k); c.height = Math.round(h * k);
  const g = c.getContext('2d'); g.drawImage(src, 0, 0, c.width, c.height);
  return { url: c.toDataURL('image/jpeg', Q), c, g };
}
// Average colour of the central 40% of the frame, where the sample should be.
function centreColour({ c, g }) {
  const x = Math.round(c.width * 0.3), y = Math.round(c.height * 0.3), w = Math.max(1, Math.round(c.width * 0.4)), h = Math.max(1, Math.round(c.height * 0.4));
  const d = g.getImageData(x, y, w, h).data; let r = 0, gg = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 16) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
  return [r / n, gg / n, b / n];
}
function accept(type, shot) {
  PH[type] = shot.url; PH.msg = '';
  if (type === 'hydration') { const m = nearestSwatch(centreColour(shot), URINE_CHART); PH.suggest = m.index + 1; }
  sfx.confirm();
}
export function clearPhoto(type) { PH[type] = null; if (type === 'hydration') PH.suggest = null; }

export function readFile(type, file) {
  return new Promise(res => {
    if (!file || !/^image\//.test(file.type)) { PH.msg = 'Choose an image file (JPEG or PNG).'; return res(); }
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => { accept(type, shrink(im)); res(); }; im.onerror = () => { PH.msg = 'That image could not be opened.'; res(); }; im.src = fr.result; };
    fr.onerror = () => { PH.msg = 'That file could not be read.'; res(); };
    fr.readAsDataURL(file);
  });
}

// Live camera capture in an overlay. Falls back to a message when the camera is unavailable or blocked.
export function openCamera(type, done) {
  const ov = document.createElement('div'); ov.className = 'overlay camov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Camera');
  ov.innerHTML = `<div class="modal cam"><div class="kicker">CAMERA · ${type === 'hydration' ? 'HYDRATION CHECK' : 'ULTRASOUND IMAGE'}</div>
    <div class="camview"><video playsinline muted autoplay></video>${type === 'hydration' ? '<i class="camtarget" aria-hidden="true"></i>' : ''}<p class="camwait">Starting the camera…</p></div>
    <p class="small soft">${type === 'hydration' ? 'Hold the sample against a white background in even light and fill the square with it.' : 'Photograph the ultrasound screen straight on, without glare.'} The photo stays on this device.</p>
    <div class="mbar"><button class="btn" data-cam="cancel">Cancel</button><span style="flex:1"></span><button class="btn primary big" data-cam="snap" disabled>📷 Capture</button></div></div>`;
  document.body.appendChild(ov); document.body.classList.add('modal-open');
  const video = ov.querySelector('video'), snap = ov.querySelector('[data-cam=snap]'), wait = ov.querySelector('.camwait');
  let stream = null;
  const close = () => { if (stream) stream.getTracks().forEach(t => t.stop()); ov.remove(); document.body.classList.remove('modal-open'); document.removeEventListener('keydown', esc); done(); };
  const esc = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);
  ov.addEventListener('click', e => {
    const b = e.target.closest('[data-cam]'); if (!b) return;
    if (b.dataset.cam === 'snap') { accept(type, shrink(video)); }
    close();
  });
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { wait.textContent = 'This browser cannot open the camera here. Use Attach image instead.'; return; }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } }, audio: false })
    .then(s => { stream = s; video.srcObject = s; video.onloadedmetadata = () => { wait.remove(); snap.disabled = false; snap.focus(); }; })
    .catch(() => { wait.textContent = 'Camera access was blocked or no camera was found. Allow camera access, or use Attach image instead.'; });
}

export function photoBar(type) {
  const p = PH[type];
  return `<div class="photobar">
    <button class="btn" data-act="cam-open" data-type="${type}">📷 Take photo</button>
    <label class="btn filebtn">🖼️ Attach image<input type="file" accept="image/*" capture="environment" data-photo="${type}"></label>
    ${p ? `<span class="pv"><img src="${p}" alt="Photo to be logged with this ${type === 'hydration' ? 'hydration check' : 'ultrasound session'}"><button class="btn ghost" data-act="cam-clear" data-type="${type}">Remove</button></span>` : ''}
    ${PH.msg ? `<span class="small" style="color:var(--s3)" role="alert">${PH.msg}</span>` : ''}</div>`;
}
// Keep only the newest photos so local storage stays small; older entries keep their text summary.
export function prunePhotos(extra) {
  const withPhoto = extra.filter(x => x.photo);
  withPhoto.slice(0, Math.max(0, withPhoto.length - MAX_PHOTOS)).forEach(x => { delete x.photo; x.photoPruned = true; });
}
