// Ambient drifting starfield behind the HUD. Static when the viewer prefers reduced motion.
export function starfield() {
  if (document.getElementById('stars')) return;
  const c = document.createElement('canvas'); c.id = 'stars'; c.setAttribute('aria-hidden', 'true');
  const hex = document.createElement('div'); hex.className = 'hexbg';
  document.body.prepend(hex); document.body.prepend(c);
  const g = c.getContext('2d'); if (!g) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, stars = [], last = 0;
  const seed = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  function size() {
    const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; c.width = W * d; c.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
    stars = Array.from({ length: Math.round(W * H / 6500) }, () => ({ x: seed() * W, y: seed() * H, z: 0.3 + seed() * 1.4, t: seed() * 6.28, hue: seed() < 0.15 ? '0,229,255' : seed() < 0.05 ? '0,255,157' : '220,240,255' }));
  }
  function draw(ts) {
    const dt = Math.min(50, ts - last || 16); last = ts;
    g.clearRect(0, 0, W, H);
    for (const s of stars) {
      if (!still) { s.x -= s.z * dt * 0.006; s.t += dt * 0.002 * s.z; if (s.x < -2) { s.x = W + 2; s.y = seed() * H; } }
      const a = 0.35 + 0.35 * Math.sin(s.t) * (s.z > 1.2 ? 1 : 0.4);
      g.fillStyle = `rgba(${s.hue},${Math.max(0.1, a)})`; g.beginPath(); g.arc(s.x, s.y, s.z * 0.8, 0, 6.283); g.fill();
    }
    if (!still) requestAnimationFrame(draw);
  }
  size(); addEventListener('resize', () => { size(); if (still) draw(0); }); requestAnimationFrame(draw);
}
