/* deck-architect v4.5 FX Plugin: confetti-burst (one-shot celebratory burst that auto-stops) */
(function () {
  if (!window.__deckFx) return;
  window.__deckFx.register('confetti-burst', ({ ctx, w, h, palette }) => {
    const cols = [palette.primary, palette.secondary, palette.warm, '244,114,182'];
    const parts = Array.from({ length: 42 }, (_, i) => {
      const ang = -Math.PI * (0.18 + (i / 42) * 0.64) + (Math.sin(i * 3.1) * 0.14);
      const spd = 1.9 + (i % 6) * 0.42;
      return {
        x: w * 0.5 + (i % 5 - 2) * 10,
        y: h * 0.72,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.6,
        w: 3.2 + (i % 3) * 1.2,
        h: 1.8 + (i % 2) * 1.1,
        rot: i * 0.4,
        vr: (i % 2 ? 1 : -1) * 0.08,
        col: cols[i % cols.length],
        life: 1,
      };
    });
    let start = 0;
    return now => {
      if (!start) start = now;
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045;
        p.vx *= 0.992;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / 2400);
        if (p.life <= 0.01 || p.y > h + 10) continue;
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = 'rgba(' + p.col + ',' + (p.life * 0.85).toFixed(3) + ')';
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      return alive > 0;
    };
  });
})();
