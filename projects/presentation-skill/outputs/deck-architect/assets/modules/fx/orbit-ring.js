/* deck-architect v4.5 FX Plugin: orbit-ring (slow geometric orbital arcs) */
(function () {
  if (!window.__deckFx) return;
  window.__deckFx.register('orbit-ring', ({ ctx, w, h, palette }) => {
    const cx = w * 0.72;
    const cy = h * 0.5;
    const baseA = palette.isLight ? 0.14 : 0.22;
    const rings = [
      { r: 62, speed: 0.00028, arc: 1.5, col: palette.primary },
      { r: 102, speed: -0.00019, arc: 2.1, col: palette.secondary },
      { r: 146, speed: 0.00013, arc: 1.2, col: palette.primary },
    ];
    let last = 0;
    return now => {
      if (now - last < 45) return true;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const rg of rings) {
        const a0 = now * rg.speed;
        ctx.strokeStyle = 'rgba(' + rg.col + ',' + (baseA * 0.45).toFixed(3) + ')';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, rg.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(' + rg.col + ',' + (baseA * 1.4).toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, rg.r, a0, a0 + rg.arc);
        ctx.stroke();

        const px = cx + Math.cos(a0 + rg.arc) * rg.r;
        const py = cy + Math.sin(a0 + rg.arc) * rg.r;
        ctx.fillStyle = 'rgba(' + rg.col + ',' + (baseA * 2.2).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    };
  });
})();
