/* deck-architect v4.5 FX Plugin: ambient-dust (floating light particles) */
(function () {
  if (!window.__deckFx) return;
  window.__deckFx.register('ambient-dust', ({ ctx, w, h, slide, palette }) => {
    const custom = getComputedStyle(slide).getPropertyValue('--fx-color').trim();
    const rgb = custom ? window.__deckFx.parseRgb(custom, palette.primary) : (palette.isLight ? palette.primary : '255,232,188');
    const alphaScale = palette.isLight ? 0.65 : 1;
    const pts = Array.from({ length: 20 }, (_, i) => ({
      x: 170 + ((i * 53) % 295),
      y: (i * 23) % h,
      r: 0.7 + (i % 3) * 0.45,
      vy: -0.07 - (i % 4) * 0.025,
      vx: -0.04 + (i % 3) * 0.025,
      ph: i * 0.7,
      a: (0.22 + (i % 4) * 0.08) * alphaScale,
    }));
    let last = 0;
    return now => {
      if (now - last < 40) return true;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(now * 0.0008 + p.ph) * 0.04;
        if (p.y < -4) { p.y = h + 4; p.x = 170 + Math.random() * 295; }
        if (p.x < 100) p.x = w - 8;
        const alpha = p.a * (0.65 + 0.35 * Math.sin(now * 0.0014 + p.ph));
        ctx.fillStyle = 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    };
  });
})();
