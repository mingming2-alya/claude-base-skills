/* deck-architect v4.5 FX Plugin: soft-aurora (drifting theme-aware radial orbs) */
(function () {
  if (!window.__deckFx) return;
  window.__deckFx.register('soft-aurora', ({ ctx, w, h, palette }) => {
    const k = palette.isLight ? 0.72 : 1;
    const orbs = [
      { x: 365, y: 120, rx: 115, col: palette.primary, a: 0.11 * k, sp: 0.00055, ph: 0 },
      { x: 130, y: 210, rx: 95, col: palette.secondary, a: 0.085 * k, sp: 0.00042, ph: 2.1 },
      { x: 280, y: 220, rx: 85, col: palette.warm, a: 0.065 * k, sp: 0.00038, ph: 4.2 },
    ];
    let last = 0;
    return now => {
      if (now - last < 50) return true;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const o of orbs) {
        const dx = Math.sin(now * o.sp + o.ph) * 11;
        const dy = Math.cos(now * o.sp * 0.8 + o.ph) * 7;
        const a = o.a * (0.78 + 0.22 * Math.sin(now * o.sp * 1.4 + o.ph));
        const g = ctx.createRadialGradient(o.x + dx, o.y + dy, 0, o.x + dx, o.y + dy, o.rx);
        g.addColorStop(0, 'rgba(' + o.col + ',' + a.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + o.col + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x + dx, o.y + dy, o.rx, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    };
  });
})();
