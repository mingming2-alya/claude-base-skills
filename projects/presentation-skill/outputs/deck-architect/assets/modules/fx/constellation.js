/* deck-architect v4.5 FX Plugin: constellation (subtle drifting network mesh) */
(function () {
  if (!window.__deckFx) return;
  window.__deckFx.register('constellation', ({ ctx, w, h, palette }) => {
    const col = palette.primary;
    const baseA = palette.isLight ? 0.22 : 0.34;
    const nodes = Array.from({ length: 22 }, (_, i) => ({
      x: ((i * 73) % (w - 40)) + 20,
      y: ((i * 47) % (h - 30)) + 15,
      vx: ((i % 2 ? 1 : -1) * (0.06 + (i % 4) * 0.02)),
      vy: (((i + 1) % 2 ? 1 : -1) * (0.05 + (i % 3) * 0.02)),
      r: 0.9 + (i % 3) * 0.35,
    }));
    let last = 0;
    return now => {
      if (now - last < 45) return true;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 8 || n.x > w - 8) n.vx *= -1;
        if (n.y < 8 || n.y > h - 8) n.vy *= -1;
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 7225) {
            const a = (1 - Math.sqrt(d2) / 85) * baseA * 0.55;
            ctx.strokeStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(' + col + ',' + baseA.toFixed(3) + ')';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    };
  });
})();
