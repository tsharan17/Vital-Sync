// 3D human body scan. The body surface is generated in code from a signed distance field and meshed with surface nets.
// Code generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team.
import * as THREE from 'three';
THREE.ColorManagement.enabled = false;

let pickRegion = () => {};
export const onPick = fn => { pickRegion = fn; };

export const Holo = (() => {
  let R, scene, cam, group, halo, scan, host, ro, raf = 0, rotY = 0.45, dragging = false, moved = 0, lastX = 0, sel = null, t = 0, failed = false;
  let bodyMat, bodyMesh; const KEYS = ['head', 'chest', 'core', 'legs'], lev = {head: 0, chest: 0, core: 0, legs: 0}, BASE = [0.12, 0.3, 0.55, 0.78], COLS = ['#00e5ff', '#5ad8ff', '#ffb703', '#ff2a5f'], COB = '#00e5ff', HOT = {head: [0, 3.84, 0.42], chest: [0.24, 2.5, 0.52], core: [0, 1.12, 0.52], legs: [0.42, -0.92, 0.28]}, hots = {}; let wire, focusKey = null, camY = 0.6, camZ = 15.5, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Human form: a signed distance field of blended ellipsoids and tapered capsules, meshed with surface nets. Units are metres, feet at y = 0. */
  function sdf(x, y, z) {
    const ax = Math.abs(x);
    const sm = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
    const ell = (px, cx, cy, cz, rx, ry, rz) => { const dx = (px - cx) / rx, dy = (y - cy) / ry, dz = (z - cz) / rz; return (Math.sqrt(dx * dx + dy * dy + dz * dz) - 1) * Math.min(rx, ry, rz); };
    const cap = (px, ax0, ay, az, bx, by, bz, r1, r2) => { const pax = px - ax0, pay = y - ay, paz = z - az, bax = bx - ax0, bay = by - ay, baz = bz - az; let h = (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz); h = h < 0 ? 0 : h > 1 ? 1 : h; const dx = pax - bax * h, dy = pay - bay * h, dz = paz - baz * h; return Math.sqrt(dx * dx + dy * dy + dz * dz) - (r1 + (r2 - r1) * h); };
    let d = ell(x, 0, 1.645, 0.004, 0.081, 0.1, 0.095);
    d = sm(d, ell(x, 0, 1.585, 0.03, 0.058, 0.07, 0.068), 0.03);
    d = sm(d, cap(x, 0, 1.45, -0.012, 0, 1.56, 0, 0.054, 0.047), 0.025);
    let b = ell(x, 0, 1.3, 0, 0.158, 0.155, 0.103);
    b = sm(b, cap(ax, 0, 1.44, -0.015, 0.165, 1.425, -0.012, 0.062, 0.05), 0.06);
    b = sm(b, ell(ax, 0.082, 1.325, 0.066, 0.082, 0.062, 0.038), 0.045);
    b = sm(b, ell(x, 0, 1.11, 0.004, 0.13, 0.135, 0.09), 0.08);
    b = sm(b, ell(x, 0, 0.965, 0, 0.158, 0.105, 0.102), 0.07);
    b = sm(b, ell(ax, 0.075, 0.925, -0.058, 0.078, 0.08, 0.058), 0.04);
    d = sm(d, b, 0.03);
    let a = cap(ax, 0.2, 1.41, -0.012, 0.25, 1.135, -0.02, 0.05, 0.04);
    a = sm(a, ell(ax, 0.208, 1.4, -0.012, 0.056, 0.072, 0.058), 0.03);
    a = sm(a, cap(ax, 0.25, 1.135, -0.02, 0.292, 0.89, 0.03, 0.041, 0.026), 0.025);
    a = sm(a, ell(ax, 0.305, 0.8, 0.046, 0.02, 0.066, 0.036), 0.02);
    d = sm(d, a, 0.035);
    let l = cap(ax, 0.088, 0.9, 0, 0.098, 0.52, 0.012, 0.086, 0.055);
    l = sm(l, cap(ax, 0.098, 0.52, 0.012, 0.098, 0.1, -0.012, 0.052, 0.034), 0.03);
    l = sm(l, ell(ax, 0.098, 0.37, -0.026, 0.05, 0.11, 0.05), 0.03);
    l = sm(l, cap(ax, 0.098, 0.045, -0.02, 0.104, 0.03, 0.13, 0.036, 0.03), 0.03);
    return sm(d, l, 0.04);
  }
  const region = (x, y) => y > 1.5 ? 'head' : (Math.abs(x) > 0.19 && y > 0.7 && y < 1.47) ? 'arms' : y > 1.19 ? 'chest' : y > 0.9 ? 'core' : 'legs';
  function surfaceNets(data, dims) {
    const ce = new Int32Array(24), et = new Int32Array(256); let k = 0;
    for (let i = 0; i < 8; ++i) for (let j = 1; j <= 4; j <<= 1) { const q = i ^ j; if (i <= q) { ce[k++] = i; ce[k++] = q; } }
    for (let i = 0; i < 256; ++i) { let em = 0; for (let j = 0; j < 24; j += 2) { const p = !!(i & (1 << ce[j])), q = !!(i & (1 << ce[j + 1])); em |= p !== q ? (1 << (j >> 1)) : 0; } et[i] = em; }
    const verts = [], quads = [], x = [0, 0, 0], Rr = [1, dims[0] + 1, (dims[0] + 1) * (dims[1] + 1)], grid = new Float32Array(8), buffer = new Int32Array(Rr[2] * 2);
    let n = 0, bn = 1;
    for (x[2] = 0; x[2] < dims[2] - 1; ++x[2], n += dims[0], bn ^= 1, Rr[2] = -Rr[2]) {
      let m = 1 + (dims[0] + 1) * (1 + bn * (dims[1] + 1));
      for (x[1] = 0; x[1] < dims[1] - 1; ++x[1], ++n, m += 2) for (x[0] = 0; x[0] < dims[0] - 1; ++x[0], ++n, ++m) {
        let mask = 0, g = 0, idx = n;
        for (let c = 0; c < 2; ++c, idx += dims[0] * (dims[1] - 2)) for (let j = 0; j < 2; ++j, idx += dims[0] - 2) for (let i = 0; i < 2; ++i, ++g, ++idx) { const p = data[idx]; grid[g] = p; mask |= p < 0 ? (1 << g) : 0; }
        if (mask === 0 || mask === 0xff) continue;
        const em = et[mask], v = [0, 0, 0]; let ec = 0;
        for (let i = 0; i < 12; ++i) { if (!(em & (1 << i))) continue; ++ec; const e0 = ce[i << 1], e1 = ce[(i << 1) + 1], g0 = grid[e0], g1 = grid[e1]; let tt = g0 - g1; if (Math.abs(tt) > 1e-6) tt = g0 / tt; else continue; for (let j = 0, q = 1; j < 3; ++j, q <<= 1) { const p0 = e0 & q, p1 = e1 & q; if (p0 !== p1) v[j] += p0 ? 1 - tt : tt; else v[j] += p0 ? 1 : 0; } }
        const sc = 1 / ec; for (let i = 0; i < 3; ++i) v[i] = x[i] + sc * v[i];
        buffer[m] = verts.length; verts.push(v);
        for (let i = 0; i < 3; ++i) { if (!(em & (1 << i))) continue; const iu = (i + 1) % 3, iv = (i + 2) % 3; if (x[iu] === 0 || x[iv] === 0) continue; const du = Rr[iu], dv = Rr[iv]; quads.push([buffer[m], buffer[m - du], buffer[m - du - dv], buffer[m - dv]]); }
      }
    }
    return {verts, quads};
  }
  function buildBody(T) {
    const h = 0.0125, nx = 61, ny = 148, nz = 34, ox = -0.375, oy = -0.03, oz = -0.19, data = new Float32Array(nx * ny * nz), half = (nx - 1) / 2;
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = half; i < nx; i++) { const d = sdf(ox + i * h, oy + j * h, oz + k * h), o = nx * (j + ny * k); data[o + i] = d; data[o + nx - 1 - i] = d; }
    const {verts, quads} = surfaceNets(data, [nx, ny, nz]), n = verts.length, pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), e = 0.004;
    for (let i = 0; i < n; i++) {
      const x = ox + verts[i][0] * h, y = oy + verts[i][1] * h, z = oz + verts[i][2] * h; pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      let gx = sdf(x + e, y, z) - sdf(x - e, y, z), gy = sdf(x, y + e, z) - sdf(x, y - e, z), gz = sdf(x, y, z + e) - sdf(x, y, z - e); const gl = Math.hypot(gx, gy, gz) || 1;
      nor[i * 3] = gx / gl; nor[i * 3 + 1] = gy / gl; nor[i * 3 + 2] = gz / gl;
    }
    const idx = [];
    for (const q of quads) {
      const P = k => [pos[q[k] * 3], pos[q[k] * 3 + 1], pos[q[k] * 3 + 2]], p0 = P(0), p1 = P(1), p2 = P(2);
      const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2], vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
      const fn = (uy * vz - uz * vy) * nor[q[0] * 3] + (uz * vx - ux * vz) * nor[q[0] * 3 + 1] + (ux * vy - uy * vx) * nor[q[0] * 3 + 2];
      const o = fn >= 0 ? q : [q[0], q[3], q[2], q[1]];
      idx.push(o[0], o[1], o[2], o[0], o[2], o[3]);
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3)); g.setIndex(idx);
    const v4 = () => new T.Vector4(0, 0.9, 1, 0.12);
    bodyMat = new T.ShaderMaterial({transparent: true, depthWrite: false, uniforms: {uH: {value: v4()}, uC: {value: v4()}, uK: {value: v4()}, uL: {value: v4()}, uA: {value: new T.Vector4(0, 0.9, 1, 0.1)}},
      vertexShader: 'varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);vP=position;vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'uniform vec4 uH;uniform vec4 uC;uniform vec4 uK;uniform vec4 uL;uniform vec4 uA;varying vec3 vN;varying vec3 vV;varying vec3 vP;void main(){float y=vP.y;float ax=abs(vP.x);vec4 c=uL;c=mix(c,uK,smoothstep(0.87,0.93,y));c=mix(c,uC,smoothstep(1.16,1.22,y));c=mix(c,uH,smoothstep(1.47,1.53,y));float arm=smoothstep(0.18,0.21,ax)*smoothstep(0.66,0.72,y)*(1.0-smoothstep(1.43,1.49,y));c=mix(c,uA,arm);float f=pow(1.0-abs(dot(normalize(vN),normalize(vV))),1.4);gl_FragColor=vec4(c.rgb,clamp(c.a+(1.0-c.a)*f*0.92,0.0,1.0));}'});
    bodyMesh = new T.Mesh(g, bodyMat); bodyMesh.userData.key = 'body';
    wire = new T.LineSegments(new T.WireframeGeometry(g), new T.LineBasicMaterial({color: '#00e5ff', transparent: true, opacity: 0.05, blending: T.AdditiveBlending, depthWrite: false}));
    bodyMesh.add(wire);
    return bodyMesh;
  }
  function init() {
    if (failed) return false; if (R) return true;
    const T = THREE;
    try { R = new T.WebGLRenderer({antialias: true, alpha: true}); } catch (err) { failed = true; return false; }
    R.outputColorSpace = T.LinearSRGBColorSpace; R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.setClearColor(0x000000, 0);
    scene = new T.Scene(); cam = new T.PerspectiveCamera(30, 1, 0.1, 100); cam.position.set(0, 0.6, 15.5); cam.lookAt(0, 0.6, 0);
    group = new T.Group(); const body = buildBody(T); body.scale.setScalar(4.25); body.position.y = -3.13; group.add(body);
    const pad = new T.Mesh(new T.RingGeometry(1.25, 1.3, 80), new T.MeshBasicMaterial({color: COB, transparent: true, opacity: 0.45, side: T.DoubleSide})); pad.rotation.x = Math.PI / 2; pad.position.y = -3.15; group.add(pad);
    const pad2 = new T.Mesh(new T.CircleGeometry(1.25, 80), new T.MeshBasicMaterial({color: COB, transparent: true, opacity: 0.07, side: T.DoubleSide})); pad2.rotation.x = Math.PI / 2; pad2.position.y = -3.16; group.add(pad2);
    for (const k of KEYS) {
      const h = new T.Group(), p = HOT[k];
      const core = new T.Mesh(new T.SphereGeometry(0.11, 16, 12), new T.MeshBasicMaterial({color: COB, transparent: true, opacity: 0.95}));
      const ring = new T.Mesh(new T.RingGeometry(0.2, 0.24, 40), new T.MeshBasicMaterial({color: COB, transparent: true, opacity: 0.8, side: T.DoubleSide, depthWrite: false}));
      const hit = new T.Mesh(new T.SphereGeometry(0.42, 8, 6), new T.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false}));
      core.userData.key = k; hit.userData.key = k; h.add(core, ring, hit); h.position.set(p[0], p[1], p[2]); group.add(h); hots[k] = {h, core, ring};
    }
    scene.add(group);
    halo = new T.Group();
    for (const [rx, rz, r] of [[1.25, 0.3, 2.7], [1.9, -0.5, 3.0]]) { const m = new T.Mesh(new T.TorusGeometry(r, 0.012, 6, 140), new T.MeshBasicMaterial({color: COB, transparent: true, opacity: 0.5})); m.rotation.set(rx, 0, rz); halo.add(m); }
    const pick = new T.Mesh(new T.TorusGeometry(2.7, 0.22, 6, 60), new T.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false})); pick.rotation.set(1.25, 0, 0.3); pick.userData.key = 'halo'; halo.add(pick);
    halo.position.y = 0.8; scene.add(halo);
    scan = new T.Mesh(new T.TorusGeometry(1.45, 0.014, 6, 90), new T.MeshBasicMaterial({color: COB, transparent: true, opacity: 0.55})); scan.rotation.x = Math.PI / 2; scene.add(scan);
    const el = R.domElement, ray = new T.Raycaster(), v = new T.Vector2();
    el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Rotating 3D human body scan. Use the labels beside it to select a region.');
    el.addEventListener('pointerdown', ev => { dragging = true; moved = 0; lastX = ev.clientX; try { el.setPointerCapture(ev.pointerId); } catch (x) {} });
    el.addEventListener('pointermove', ev => { if (!dragging) return; const dx = ev.clientX - lastX; lastX = ev.clientX; moved += Math.abs(dx); rotY += dx * 0.01; });
    el.addEventListener('pointerup', ev => { dragging = false; if (moved > 5) return; const bb = el.getBoundingClientRect(); v.set((ev.clientX - bb.left) / bb.width * 2 - 1, -((ev.clientY - bb.top) / bb.height) * 2 + 1); ray.setFromCamera(v, cam); const objs = []; scene.traverse(o => { if (o.userData && o.userData.key) objs.push(o); }); const hits = ray.intersectObjects(objs, false), hit = hits.find(q => HOT[q.object.userData.key]) || hits.find(q => q.object.userData.key !== 'halo') || hits[0]; if (!hit) return; let key = hit.object.userData.key; if (key === 'body') { const lp = bodyMesh.worldToLocal(hit.point.clone()); key = region(lp.x, lp.y); } if (key !== 'arms') pickRegion(key); });
    el.addEventListener('pointercancel', () => { dragging = false; });
    return true;
  }
  function size() { if (!host || !R) return; const w = host.clientWidth, hh = host.clientHeight; if (!w || !hh) return; R.setSize(w, hh, false); cam.aspect = w / hh; cam.fov = w / hh < 0.8 ? 40 : 30; cam.updateProjectionMatrix(); }
  function frame() {
    if (!R.domElement.isConnected) { raf = 0; return; }
    t += 0.016;
    if (focusKey) { if (!dragging) rotY += (Math.round(rotY / 6.2832) * 6.2832 - rotY) * 0.06; } else if (!dragging && !still) rotY += 0.004;
    const ty = focusKey ? HOT[focusKey][1] : 0.6, tz = focusKey ? 7.2 : 15.5, k8 = still ? 1 : 0.07;
    camY += (ty - camY) * k8; camZ += (tz - camZ) * k8; cam.position.set(0, camY, camZ); cam.lookAt(0, camY, 0);
    group.rotation.y = rotY;
    wire.material.opacity = focusKey ? 0.1 + 0.08 * Math.sin(t * 4) : 0.05;
    for (const k of KEYS) { const o = hots[k], c = COLS[lev[k]], pulse = 1 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3 + k.length)); o.core.material.color.set(c); o.ring.material.color.set(c); o.ring.quaternion.copy(cam.quaternion); o.ring.quaternion.premultiply(group.quaternion.clone().invert()); o.ring.scale.setScalar(k === focusKey ? pulse * 1.4 : pulse); o.ring.material.opacity = k === focusKey ? 1 : 0.55; } halo.rotation.y = -rotY * 0.6 + t * 0.15; scan.position.y = still ? 2 : 0.6 + Math.sin(t * 0.7) * 3.5;
    const U = {head: 'uH', chest: 'uC', core: 'uK', legs: 'uL'}; for (const k of KEYS) { const c = new THREE.Color(COLS[lev[k]]), a = BASE[lev[k]] + (k === sel ? 0.1 + 0.1 * Math.sin(t * 3.2) : 0); bodyMat.uniforms[U[k]].value.set(c.r, c.g, c.b, Math.min(0.95, a)); }
    R.render(scene, cam); raf = requestAnimationFrame(frame);
  }
  function mount(el, L, selected, focus) {
    if (!init()) return false;
    host = el; sel = selected; focusKey = focus && HOT[focus] ? focus : null; if (focusKey) sel = focusKey; el.prepend(R.domElement);
    for (const k of KEYS) lev[k] = L[k];
    halo.children.forEach(m => { if (!m.userData.key) { m.material.color.set(L.halo ? COLS[L.halo] : COB); m.material.opacity = [0.35, 0.6, 0.85, 1][L.halo]; } });
    if (ro) ro.disconnect(); if (window.ResizeObserver) { ro = new ResizeObserver(size); ro.observe(el); } size();
    if (!raf) raf = requestAnimationFrame(frame);
    return true;
  }
  return {mount};
})();
