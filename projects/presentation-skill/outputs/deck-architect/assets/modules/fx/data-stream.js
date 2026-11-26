/* deck-architect v4.5 FX Plugin: data-stream (faint telemetry signal streaks) */
(function () {
  if (!window.__deckFx) return;
  window.__deckFx.register('data-stream', ({ ctx, w, h, palette }) => {
    const col = palette.primary;
    const col2 = palette.secondary;
    const baseA = palette.isLight ? 0.16 : 0.24;
    const streaks = Array.from({ length: 16 }, (_, i) => ({
      x: 24 + ((i * 29) % (w - 48)),
      y: (i * 37) % h,
      len: 18 + (i % 4) * 14,
      vy: 0.45 + (i % 5) * 0.16,
      alt: i % 3 === 0,
    }));
    let last = 0;
    return now => {
      if (now - last < 42) return true;
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const s of streaks) {
        s.y += s.vy;
        if (s.y - s.len > h) s.y = -10;
        const c = s.alt ? col2 : col;
        const g = ctx.createLinearGradient(s.x, s.y - s.len, s.x, s.y);
        g.addColorStop(0, 'rgba(' + c + ',0)');
        g.addColorStop(1, 'rgba(' + c + ',' + baseA.toFixed(3) + ')');
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - s.len);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(' + c + ',' + (baseA * 1.5).toFixed(3) + ')';
        ctx.fillRect(s.x - 0.8, s.y - 1.2, 1.6, 2);
      }
      return true;
    };
  });
})();
