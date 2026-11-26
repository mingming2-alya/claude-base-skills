/* deck-architect v4.5 On-Demand Module: visual-flair
 *  - [data-zoomable]: click-to-zoom fullscreen lightbox (#deck-lightbox, overlay priority 80)
 *  - [data-tilt]: subtle 3D perspective card tilt clamped to <= 5deg
 *  - [data-spotlight-hover]: cursor-following radial accent sheen
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  // ---- 1. Click-to-zoom lightbox ([data-zoomable])
  let lb = null;
  function ensureLightbox() {
    if (lb) return lb;
    lb = document.createElement('div');
    lb.id = 'deck-lightbox';
    lb.className = 'live-ctrl';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', '放大檢視');
    lb.innerHTML =
      '<div class="dlb-frame">' +
        '<button type="button" class="dlb-close" aria-label="關閉放大視窗">×</button>' +
        '<div class="dlb-content"></div>' +
        '<div class="dlb-cap"></div>' +
      '</div>';
    document.body.appendChild(lb);
    const close = () => lb.classList.remove('open');
    lb.querySelector('.dlb-close').addEventListener('click', e => { e.stopPropagation(); close(); });
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    if (typeof deck.registerOverlay === 'function') {
      deck.registerOverlay({
        id: 'lightbox',
        priority: 80,
        lockNav: true,
        isOpen: () => lb.classList.contains('open'),
        close,
      });
    }
    return lb;
  }

  const isStill = () => (typeof deck.isStill === 'function' ? deck.isStill() : deck.isStatic());
  const isReduced = () => (typeof deck.isReducedMotion === 'function' ? deck.isReducedMotion() : deck.isStatic());
  const getScale = () => (typeof deck.stageScale === 'function' ? deck.stageScale() : 1) || 1;

  document.querySelectorAll('[data-zoomable]').forEach(el => {
    el.classList.add('live-ctrl');
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (isStill()) return;
      const modal = ensureLightbox();
      const sl = el.closest('.slide');
      const surf = (sl && sl.dataset.surface) || deck.activeSurface || 'dark';
      modal.dataset.surface = surf;
      const slot = modal.querySelector('.dlb-content');
      const cap = modal.querySelector('.dlb-cap');
      slot.innerHTML = '';
      const target = el.matches('img, svg') ? el : (el.querySelector('svg, img') || el);
      const clone = target.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-zoomable');
      clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      if (sl && sl.dataset.slideScope) {
        const wrap = document.createElement('div');
        wrap.className = 'dlb-scope';
        wrap.dataset.slideScope = sl.dataset.slideScope;
        wrap.appendChild(clone);
        slot.appendChild(wrap);
      } else {
        slot.appendChild(clone);
      }
      const caption = el.dataset.zoomCaption || el.getAttribute('aria-label') || el.getAttribute('alt') || '';
      cap.textContent = caption;
      cap.style.display = caption ? '' : 'none';
      modal.classList.add('open');
    });
  });

  // ---- 2. Subtle 3D Tilt ([data-tilt], max <= 5deg)
  document.querySelectorAll('[data-tilt]').forEach(el => {
    const maxDeg = Math.min(5, Math.max(1, parseFloat(el.dataset.tilt || '4') || 4));
    el.addEventListener('pointermove', e => {
      if (isReduced()) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      const rx = (-ny * maxDeg).toFixed(2);
      const ry = (nx * maxDeg).toFixed(2);
      el.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translate3d(0,-2px,0)';
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });

  // ---- 3. Spotlight hover ([data-spotlight-hover])
  document.querySelectorAll('[data-spotlight-hover]').forEach(el => {
    el.addEventListener('pointermove', e => {
      if (isReduced()) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const s = getScale();
      el.style.setProperty('--mx', ((e.clientX - r.left) / s).toFixed(1) + 'px');
      el.style.setProperty('--my', ((e.clientY - r.top) / s).toFixed(1) + 'px');
    });
  });

  function clearTilts() {
    document.querySelectorAll('[data-tilt]').forEach(el => { el.style.transform = ''; });
  }

  deck.stage.addEventListener('deck:slideleave', () => {
    if (lb) lb.classList.remove('open');
    clearTilts();
  });
  deck.stage.addEventListener('deck:still', ({ detail }) => {
    if (detail.still) {
      if (lb) lb.classList.remove('open');
      clearTilts();
    }
  });
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => {
    if (detail.lowPower) clearTilts();
  });
  deck.stage.addEventListener('deck:reducedmotion', ({ detail }) => {
    if (detail.reduced) clearTilts();
  });
})();
