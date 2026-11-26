/* deck-architect v4.5 On-Demand Module: coverflow & gallery
 *  - Pure GPU 3D perspective CoverFlow carousel ([data-coverflow]) + optional [data-cf-lightbox] preview
 *  - Seamless infinite marquee logo/card wall ([data-marquee]) with clean static/print grid fallback
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const instances = [];

  // Shared CoverFlow Lightbox (registered in Layer 0 overlay registry)
  let lbEl = null;
  function ensureLightbox() {
    if (lbEl) return lbEl;
    lbEl = document.createElement('div');
    lbEl.id = 'cf-lightbox';
    lbEl.className = 'live-ctrl';
    lbEl.innerHTML =
      '<div class="cfl-box">' +
        '<button type="button" class="cfl-close" aria-label="關閉預覽">×</button>' +
        '<div class="cfl-media"></div>' +
        '<div class="cfl-cap"></div>' +
      '</div>';
    document.body.appendChild(lbEl);
    const close = () => lbEl.classList.remove('open');
    lbEl.querySelector('.cfl-close').addEventListener('click', e => { e.stopPropagation(); close(); });
    lbEl.addEventListener('click', e => { if (e.target === lbEl) close(); });
    if (typeof deck.registerOverlay === 'function') {
      deck.registerOverlay({
        id: 'cf-lightbox',
        priority: 80,
        lockNav: true,
        isOpen: () => lbEl.classList.contains('open'),
        close,
      });
    }
    return lbEl;
  }

  const isStill = () => (typeof deck.isStill === 'function' ? deck.isStill() : deck.isStatic());
  const isReduced = () => (typeof deck.isReducedMotion === 'function' ? deck.isReducedMotion() : deck.isStatic());

  function openLightbox(item) {
    if (isStill()) return;
    const lb = ensureLightbox();
    const mediaSlot = lb.querySelector('.cfl-media');
    const capSlot = lb.querySelector('.cfl-cap');
    mediaSlot.innerHTML = '';
    const media = item.querySelector('img, svg');
    if (media) {
      const clone = media.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      mediaSlot.appendChild(clone);
    }
    const cap = item.querySelector('figcaption');
    capSlot.textContent = cap ? cap.textContent.trim() : '';
    capSlot.style.display = capSlot.textContent ? '' : 'none';
    lb.classList.add('open');
  }

  // ---- CoverFlow instances
  document.querySelectorAll('[data-coverflow]').forEach(root => {
    root.classList.add('live-ctrl');
    const items = [...root.querySelectorAll('.cf-item')];
    if (!items.length) return;

    const n = items.length;
    const defaultCenter = Math.floor(n / 2);
    const stillIdx = Math.max(0, Math.min(n - 1, parseInt(root.dataset.initial ?? String(defaultCenter), 10)));
    const intervalMs = Math.max(1500, parseInt(root.dataset.interval || '3800', 10) || 3800);
    const autoplay = root.dataset.autoplay !== 'false';
    const spreadX = parseFloat(root.dataset.spreadX || '410');
    const enableLightbox = root.hasAttribute('data-cf-lightbox');

    const dotsHost = root.querySelector('.cf-dots');
    const prevBtn = root.querySelector('.cf-prev');
    const nextBtn = root.querySelector('.cf-next');
    let dots = [];

    if (dotsHost) {
      dotsHost.innerHTML = items.map((_, i) =>
        '<button type="button" class="cf-dot" data-cf-dot="' + i + '" aria-label="切換至第 ' + (i + 1) + ' 張"></button>'
      ).join('');
      dots = [...dotsHost.querySelectorAll('.cf-dot')];
    }

    let idx = stillIdx;
    let timer = 0;
    let pausedByHover = false;

    function shortestOffset(i, center) {
      let d = i - center;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      return d;
    }

    function layout(nextIdx) {
      idx = ((nextIdx % n) + n) % n;
      root.dataset.activeIndex = String(idx);
      items.forEach((el, i) => {
        const d = shortestOffset(i, idx);
        const abs = Math.abs(d);
        const sign = d < 0 ? -1 : (d > 0 ? 1 : 0);
        const tx = abs === 0 ? 0 : sign * (spreadX * (abs === 1 ? 1 : 1.56));
        const tz = abs === 0 ? 0 : (abs === 1 ? -190 : -340);
        const ry = abs === 0 ? 0 : -sign * (abs === 1 ? 28 : 38);
        const sc = abs === 0 ? 1 : (abs === 1 ? 0.84 : 0.70);
        const op = abs === 0 ? 1 : (abs === 1 ? 0.62 : (abs === 2 ? 0.28 : 0));

        el.style.transform =
          'translate3d(' + tx.toFixed(1) + 'px, 0px, ' + tz + 'px) rotateY(' + ry + 'deg) scale(' + sc + ')';
        el.style.opacity = String(op);
        el.style.zIndex = String(10 - Math.min(9, abs * 2));
        el.style.pointerEvents = abs <= 2 ? 'auto' : 'none';
        el.classList.toggle('is-active', abs === 0);
        el.setAttribute('aria-hidden', abs === 0 ? 'false' : 'true');
      });
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx));
    }

    function stop() {
      if (timer) { clearTimeout(timer); timer = 0; }
    }

    function schedule() {
      stop();
      if (!autoplay || isReduced() || pausedByHover) return;
      const sl = root.closest('.slide');
      if (!sl || deck.slides[deck.index] !== sl) return;
      timer = setTimeout(() => {
        layout(idx + 1);
        schedule();
      }, intervalMs);
    }

    items.forEach((el, i) => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        if (i !== idx) {
          layout(i);
          schedule();
        } else if (enableLightbox) {
          openLightbox(el);
        }
      });
    });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        e.stopPropagation();
        layout(i);
        schedule();
      });
    });
    if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); layout(idx - 1); schedule(); });
    if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); layout(idx + 1); schedule(); });

    root.addEventListener('mouseenter', () => { pausedByHover = true; stop(); });
    root.addEventListener('mouseleave', () => { pausedByHover = false; schedule(); });

    layout(stillIdx);
    const api = { root, slide: root.closest('.slide'), layout, schedule, stop, stillIdx, get index() { return idx; } };
    root._coverflow = api;
    instances.push(api);
  });

  // ---- Seamless Marquee ([data-marquee])
  document.querySelectorAll('[data-marquee]').forEach(root => {
    const track = root.querySelector('.mq-track');
    if (!track || track.dataset.mqCloned === '1') return;
    const speed = parseFloat(root.dataset.speed || '26');
    if (Number.isFinite(speed) && speed > 2) root.style.setProperty('--mq-speed', speed + 's');
    const originals = [...track.children];
    originals.forEach(node => {
      const clone = node.cloneNode(true);
      clone.classList.add('mq-dup');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.dataset.mqCloned = '1';
  });

  function syncForSlide(sl, reduced) {
    for (const inst of instances) {
      if (isStill()) {
        inst.stop();
        inst.layout(inst.stillIdx);
      } else if (reduced || isReduced()) {
        inst.stop();
      } else if (inst.slide === sl) {
        inst.schedule();
      } else {
        inst.stop();
      }
    }
  }

  deck.stage.addEventListener('deck:slideenter', ({ detail }) => syncForSlide(detail.slide, detail.reducedMotion || detail.staticMode));
  deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
    for (const inst of instances) if (inst.slide === detail.slide) inst.stop();
    if (lbEl) lbEl.classList.remove('open');
  });
  deck.stage.addEventListener('deck:still', ({ detail }) => {
    if (detail.still && lbEl) lbEl.classList.remove('open');
    syncForSlide(deck.slides[deck.index], detail.still || isReduced());
  });
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => syncForSlide(deck.slides[deck.index], detail.lowPower || isReduced()));
  deck.stage.addEventListener('deck:reducedmotion', ({ detail }) => syncForSlide(deck.slides[deck.index], detail.reduced));

  if (deck.slides[deck.index]) syncForSlide(deck.slides[deck.index], isReduced());
})();
