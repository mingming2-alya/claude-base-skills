/* deck-architect v4.5 Layer 1 Presenter Chrome: grid-overview (G key)
 * Renders a 16:9 live-scaled thumbnail matrix of all slides for instant non-linear jumping.
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  let gridEl = null;
  let bodyEl = null;
  let cards = [];
  let ctrlBtn = null;

  function slideLabel(sl, idx) {
    const h = sl.querySelector('h1, h2, .shock-text, .div-t');
    if (h && h.textContent.trim()) return h.textContent.trim().replace(/\s+/g, ' ').slice(0, 44);
    return sl.dataset.id || ('Slide ' + (idx + 1));
  }

  function rescaleThumbs() {
    if (!gridEl || !gridEl.classList.contains('open')) return;
    gridEl.querySelectorAll('.dg-thumb').forEach(box => {
      const mini = box.querySelector('.dg-thumb-stage');
      if (!mini) return;
      const w = box.clientWidth;
      if (w > 0) mini.style.transform = 'scale(' + (w / 1920).toFixed(4) + ')';
    });
  }

  const isStill = () => (typeof deck.isStill === 'function' ? deck.isStill() : deck.isStatic());

  function sanitizeCloneToFinal(clone) {
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    clone.querySelectorAll('canvas.fx-canvas, video, audio').forEach(n => n.remove());
    clone.classList.add('active');
    clone.classList.remove('leaving', 'in-flight', 'is-focusing');
    clone.style.opacity = '';
    clone.style.transform = '';
    clone.style.clipPath = '';
    clone.style.visibility = '';
    clone.style.zIndex = '';
    clone.querySelectorAll('.focus-dim, .focus-active, .focus-visited, .pre-transform, .transforming, .spot-pulse, .is-primed, .is-folded, .has-open, .is-open, .is-rf-dim, .is-rf-focus, .is-step-dim').forEach(n => {
      n.classList.remove('focus-dim', 'focus-active', 'focus-visited', 'pre-transform', 'transforming', 'spot-pulse', 'is-primed', 'is-folded', 'has-open', 'is-open', 'is-rf-dim', 'is-rf-focus', 'is-step-dim');
    });
    clone.querySelectorAll('[data-count]').forEach(el => {
      if (el.dataset.countFinal !== undefined) {
        for (const n of el.childNodes) {
          if (n.nodeType === 3 && /\d/.test(n.nodeValue)) { n.nodeValue = el.dataset.countFinal; break; }
        }
      }
    });
    clone.querySelectorAll('[data-odometer]').forEach(el => {
      if (el.dataset.odoRaw) el.textContent = el.dataset.odoRaw;
    });
    // Snap data-step / data-step-hide / data-step-only cleanly to final step
    let maxS = 0;
    const stepEls = clone.querySelectorAll('[data-step], [data-step-hide], [data-step-only]');
    stepEls.forEach(el => {
      if (el.dataset.step !== undefined) maxS = Math.max(maxS, parseInt(el.dataset.step, 10) || 0);
      if (el.dataset.stepHide !== undefined) maxS = Math.max(maxS, parseInt(el.dataset.stepHide, 10) || 0);
      if (el.dataset.stepOnly !== undefined) maxS = Math.max(maxS, parseInt(el.dataset.stepOnly, 10) || 0);
    });
    stepEls.forEach(el => {
      let show = 0, hide = Infinity;
      if (el.dataset.stepOnly !== undefined) {
        const k = parseInt(el.dataset.stepOnly, 10) || 0;
        show = k; hide = k + 1;
      } else {
        if (el.dataset.step !== undefined) show = parseInt(el.dataset.step, 10) || 0;
        if (el.dataset.stepHide !== undefined) hide = parseInt(el.dataset.stepHide, 10) || Infinity;
      }
      el.dataset.stepHidden = (maxS >= show && maxS < hide) ? '0' : '1';
    });
  }

  function buildGrid() {
    if (gridEl) return gridEl;
    gridEl = document.createElement('div');
    gridEl.id = 'deck-grid';
    gridEl.setAttribute('role', 'dialog');
    gridEl.setAttribute('aria-modal', 'true');
    gridEl.setAttribute('aria-label', '投影片總覽');
    gridEl.innerHTML =
      '<div class="dg-head">' +
        '<div><span class="dg-title">投影片總覽</span><span class="dg-hint">點擊任意頁跳轉 · Esc 或 G 關閉</span></div>' +
        '<button type="button" class="dg-close" aria-label="關閉總覽">關閉 Esc</button>' +
      '</div>' +
      '<div class="dg-body"></div>';
    document.body.appendChild(gridEl);
    bodyEl = gridEl.querySelector('.dg-body');
    gridEl.querySelector('.dg-close').addEventListener('click', e => { e.stopPropagation(); close(); });

    let mainNum = 0;
    cards = deck.slides.map((sl, i) => {
      const isAppendix = sl.dataset.appendix === '1';
      if (!isAppendix) mainNum++;
      const numStr = isAppendix ? '附' : (mainNum < 10 ? '0' + mainNum : String(mainNum));
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dg-card';
      btn.dataset.slideIdx = String(i);

      const thumb = document.createElement('div');
      thumb.className = 'dg-thumb';
      const miniStage = document.createElement('div');
      miniStage.className = 'dg-thumb-stage';
      const clone = sl.cloneNode(true);
      sanitizeCloneToFinal(clone);
      miniStage.appendChild(clone);
      thumb.appendChild(miniStage);

      const meta = document.createElement('div');
      meta.className = 'dg-meta';
      const tag = isAppendix ? '<span class="dg-tag">附件</span>' : '';
      meta.innerHTML =
        '<span class="dg-num">' + numStr + '</span>' +
        '<span class="dg-name">' + slideLabel(sl, i).replace(/</g, '&lt;') + '</span>' +
        tag;

      btn.appendChild(thumb);
      btn.appendChild(meta);
      btn.addEventListener('click', e => {
        e.stopPropagation();
        close();
        deck.go(i, false, { step: 0 });
      });
      bodyEl.appendChild(btn);
      return btn;
    });
    return gridEl;
  }

  function isOpen() {
    return Boolean(gridEl && gridEl.classList.contains('open'));
  }

  function open() {
    if (isStill()) return;
    buildGrid();
    cards.forEach((c, i) => c.classList.toggle('is-current', i === deck.index));
    gridEl.classList.add('open');
    if (ctrlBtn) ctrlBtn.classList.add('is-on');
    requestAnimationFrame(() => {
      rescaleThumbs();
      const curCard = cards[deck.index];
      if (curCard && curCard.scrollIntoView) curCard.scrollIntoView({ block: 'nearest' });
    });
  }

  function close() {
    if (!gridEl) return;
    gridEl.classList.remove('open');
    if (ctrlBtn) ctrlBtn.classList.remove('is-on');
  }

  function toggle() {
    if (isOpen()) close();
    else open();
  }

  if (typeof deck.registerOverlay === 'function') {
    deck.registerOverlay({ id: 'grid', priority: 70, lockNav: true, isOpen, close });
  }
  if (typeof deck.addCtrlButton === 'function') {
    ctrlBtn = deck.addCtrlButton({ id: 'grid', label: '總覽 G', title: '投影片總覽 (G)', onClick: toggle });
  }

  addEventListener('resize', rescaleThumbs);
  addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'g' || e.key === 'G') {
      if (isStill()) return;
      if (!isOpen() && typeof deck.hasNavLock === 'function' && deck.hasNavLock()) return;
      e.preventDefault();
      toggle();
    }
  });
  deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) close(); });

  window.__deckGrid = { open, close, toggle, isOpen };
})();
