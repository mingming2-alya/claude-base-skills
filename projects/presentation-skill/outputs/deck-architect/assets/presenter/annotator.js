/* deck-architect v4.5 Layer 1 Presenter Chrome: annotator (A key) & laser pointer (L key)
 * Locked to #stage 1920x1080 coordinate space so strokes never drift on window resize.
 * Shortcuts: A toggle pen/highlighter, L toggle laser pointer, C clear current slide strokes, Esc exit drawing.
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const COLORS = ['#FF4D6D', '#FFD166', '#38BDF8'];

  const layer = document.createElement('div');
  layer.id = 'deck-annotator';
  layer.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'da-svg');
  svg.setAttribute('viewBox', '0 0 1920 1080');
  layer.appendChild(svg);
  deck.stage.appendChild(layer);

  const laser = document.createElement('div');
  laser.id = 'deck-laser';
  laser.setAttribute('aria-hidden', 'true');
  deck.stage.appendChild(laser);

  const bar = document.createElement('div');
  bar.id = 'deck-annotator-bar';
  bar.className = 'live-ctrl';
  bar.innerHTML =
    '<button type="button" class="dab-btn is-on" data-da-tool="pen">畫筆</button>' +
    '<button type="button" class="dab-btn" data-da-tool="hi">螢光</button>' +
    '<span class="dab-sep"></span>' +
    COLORS.map((c, i) => '<button type="button" class="dab-swatch' + (i === 0 ? ' is-on' : '') + '" data-da-color="' + c + '" style="background:' + c + '" aria-label="顏色 ' + (i + 1) + '"></button>').join('') +
    '<span class="dab-sep"></span>' +
    '<button type="button" class="dab-btn" data-da-act="undo">復原</button>' +
    '<button type="button" class="dab-btn" data-da-act="clear">清除 C</button>' +
    '<button type="button" class="dab-btn" data-da-act="done">完成 Esc</button>';
  document.body.appendChild(bar);

  const strokesBySlide = new Map();
  let drawingMode = false;
  let laserMode = false;
  let tool = 'pen';
  let color = COLORS[0];
  let activePath = null;
  let points = [];
  let ctrlBtn = null;

  function toStageCoords(clientX, clientY) {
    const r = deck.stage.getBoundingClientRect();
    const sx = r.width ? 1920 / r.width : 1;
    const sy = r.height ? 1080 / r.height : 1;
    return {
      x: Math.max(0, Math.min(1920, (clientX - r.left) * sx)),
      y: Math.max(0, Math.min(1080, (clientY - r.top) * sy)),
    };
  }

  function renderSlideStrokes() {
    svg.innerHTML = '';
    const list = strokesBySlide.get(deck.index) || [];
    for (const s of list) {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('d', s.d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', s.color);
      p.setAttribute('stroke-width', String(s.width));
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.setAttribute('stroke-opacity', String(s.opacity));
      svg.appendChild(p);
    }
  }

  const isStill = () => (typeof deck.isStill === 'function' ? deck.isStill() : deck.isStatic());

  function setDrawing(flag) {
    if (isStill()) flag = false;
    drawingMode = Boolean(flag);
    layer.classList.toggle('is-drawing', drawingMode);
    bar.classList.toggle('show', drawingMode);
    if (ctrlBtn) ctrlBtn.classList.toggle('is-on', drawingMode);
    if (drawingMode) {
      setLaser(false);
      if (typeof deck.toast === 'function') deck.toast('畫筆標註模式（按 C 清除 · Esc 退出）');
    }
  }

  function setLaser(flag) {
    if (isStill()) flag = false;
    laserMode = Boolean(flag);
    laser.classList.toggle('is-on', laserMode);
    if (laserMode) {
      if (drawingMode) setDrawing(false);
      if (typeof deck.toast === 'function') deck.toast('雷射筆已開啟（按 L 關閉）');
    }
  }

  function clearCurrent() {
    strokesBySlide.delete(deck.index);
    renderSlideStrokes();
  }

  function undoCurrent() {
    const list = strokesBySlide.get(deck.index);
    if (!list || !list.length) return;
    list.pop();
    renderSlideStrokes();
  }

  bar.addEventListener('click', e => {
    e.stopPropagation();
    const tBtn = e.target.closest('[data-da-tool]');
    if (tBtn) {
      tool = tBtn.dataset.daTool;
      bar.querySelectorAll('[data-da-tool]').forEach(b => b.classList.toggle('is-on', b === tBtn));
      return;
    }
    const cBtn = e.target.closest('[data-da-color]');
    if (cBtn) {
      color = cBtn.dataset.daColor;
      bar.querySelectorAll('[data-da-color]').forEach(b => b.classList.toggle('is-on', b === cBtn));
      return;
    }
    const aBtn = e.target.closest('[data-da-act]');
    if (aBtn) {
      const act = aBtn.dataset.daAct;
      if (act === 'undo') undoCurrent();
      else if (act === 'clear') clearCurrent();
      else if (act === 'done') setDrawing(false);
    }
  });

  layer.addEventListener('pointerdown', e => {
    if (!drawingMode) return;
    e.stopPropagation();
    e.preventDefault();
    layer.setPointerCapture(e.pointerId);
    const pt = toStageCoords(e.clientX, e.clientY);
    points = [pt];
    const width = tool === 'hi' ? 28 : 7;
    const opacity = tool === 'hi' ? 0.36 : 0.94;
    const d = 'M ' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', String(width));
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-opacity', String(opacity));
    svg.appendChild(path);
    activePath = { el: path, color, width, opacity, d };
  });

  layer.addEventListener('pointermove', e => {
    if (!activePath) return;
    const pt = toStageCoords(e.clientX, e.clientY);
    const prev = points[points.length - 1];
    if (Math.hypot(pt.x - prev.x, pt.y - prev.y) < 3) return;
    points.push(pt);
    activePath.d += ' L ' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1);
    activePath.el.setAttribute('d', activePath.d);
  });

  function finishStroke() {
    if (!activePath) return;
    const list = strokesBySlide.get(deck.index) || [];
    list.push({ d: activePath.d, color: activePath.color, width: activePath.width, opacity: activePath.opacity });
    strokesBySlide.set(deck.index, list);
    activePath = null;
    points = [];
  }
  layer.addEventListener('pointerup', finishStroke);
  layer.addEventListener('pointercancel', finishStroke);

  addEventListener('pointermove', e => {
    if (!laserMode) return;
    const pt = toStageCoords(e.clientX, e.clientY);
    laser.style.transform = 'translate3d(' + pt.x.toFixed(1) + 'px,' + pt.y.toFixed(1) + 'px,0)';
  }, { passive: true });

  if (typeof deck.registerOverlay === 'function') {
    deck.registerOverlay({
      id: 'annotator',
      priority: 90,
      lockNav: true,
      isOpen: () => drawingMode,
      close: () => setDrawing(false),
    });
  }
  if (typeof deck.addCtrlButton === 'function') {
    ctrlBtn = deck.addCtrlButton({
      id: 'annotator',
      label: '畫筆 A',
      title: '現場畫筆標註 (A) · 雷射筆 (L)',
      onClick: () => setDrawing(!drawingMode),
    });
  }

  addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const lockedOther = !drawingMode && typeof deck.hasNavLock === 'function' && deck.hasNavLock();
    if (e.key === 'a' || e.key === 'A') {
      if (isStill() || lockedOther) return;
      e.preventDefault();
      setDrawing(!drawingMode);
    } else if (e.key === 'l' || e.key === 'L') {
      if (isStill() || lockedOther) return;
      e.preventDefault();
      setLaser(!laserMode);
    } else if ((e.key === 'c' || e.key === 'C') && !lockedOther && (drawingMode || (strokesBySlide.get(deck.index) || []).length)) {
      e.preventDefault();
      clearCurrent();
    }
  });

  deck.stage.addEventListener('deck:slideleave', finishStroke);
  deck.stage.addEventListener('deck:slideenter', renderSlideStrokes);
  deck.stage.addEventListener('deck:still', ({ detail }) => {
    if (detail.still) { setDrawing(false); setLaser(false); }
  });

  window.__deckAnnotator = {
    setDrawing,
    setLaser,
    clear: clearCurrent,
    undo: undoCurrent,
    get isDrawing() { return drawingMode; },
    get isLaser() { return laserMode; },
    get strokeCount() { return (strokesBySlide.get(deck.index) || []).length; },
  };
})();
