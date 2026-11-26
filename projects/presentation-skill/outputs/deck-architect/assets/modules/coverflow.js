/* deck-architect v4.4 On-Demand Module: coverflow
 * Pure GPU 3D perspective CoverFlow carousel ([data-coverflow]).
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const instances = [];

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
      if (!autoplay || deck.isStatic() || pausedByHover) return;
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
        if (i !== idx) { layout(i); schedule(); }
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

  function syncForSlide(sl, staticMode) {
    for (const inst of instances) {
      if (staticMode) {
        inst.stop();
        inst.layout(inst.stillIdx);
      } else if (inst.slide === sl) {
        inst.schedule();
      } else {
        inst.stop();
      }
    }
  }

  deck.stage.addEventListener('deck:slideenter', ({ detail }) => syncForSlide(detail.slide, detail.staticMode));
  deck.stage.addEventListener('deck:slideleave', ({ detail }) => {
    for (const inst of instances) if (inst.slide === detail.slide) inst.stop();
  });
  deck.stage.addEventListener('deck:still', ({ detail }) => syncForSlide(deck.slides[deck.index], detail.still));
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => syncForSlide(deck.slides[deck.index], detail.lowPower));

  if (deck.slides[deck.index]) syncForSlide(deck.slides[deck.index], deck.isStatic());
})();
