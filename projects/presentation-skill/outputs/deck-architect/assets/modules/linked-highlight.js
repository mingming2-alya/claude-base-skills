/* deck-architect v4.5 On-Demand Module: linked-highlight
 * Hover or click any [data-ref="id"] element to highlight all matching prose & diagram nodes
 * inside the same slide and gently dim non-matching siblings.
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const isStill = () => (typeof deck.isStill === 'function' ? deck.isStill() : deck.isStatic());

  function idsOf(el) {
    return (el.dataset.ref || '').split(/[\s,]+/).filter(Boolean);
  }

  deck.slides.forEach(sl => {
    const refs = [...sl.querySelectorAll('[data-ref]')];
    if (!refs.length) return;
    let lockedIds = null;

    function apply(activeIds, locked) {
      if (isStill() || !activeIds || !activeIds.length) {
        sl.classList.remove('is-ref-linking');
        refs.forEach(el => el.classList.remove('is-ref-hit', 'is-ref-dim', 'is-ref-locked'));
        return;
      }
      sl.classList.add('is-ref-linking');
      refs.forEach(el => {
        const hit = idsOf(el).some(id => activeIds.includes(id));
        el.classList.toggle('is-ref-hit', hit);
        el.classList.toggle('is-ref-dim', !hit);
        el.classList.toggle('is-ref-locked', Boolean(locked && hit));
      });
    }

    function clearAll() {
      lockedIds = null;
      apply(null, false);
    }

    refs.forEach(el => {
      el.classList.add('live-ctrl');
      el.addEventListener('mouseenter', () => {
        if (lockedIds || isStill()) return;
        apply(idsOf(el), false);
      });
      el.addEventListener('mouseleave', () => {
        if (lockedIds) return;
        apply(null, false);
      });
      el.addEventListener('click', e => {
        e.stopPropagation();
        if (isStill()) return;
        const ids = idsOf(el);
        const same = lockedIds && ids.length === lockedIds.length && ids.every((v, i) => v === lockedIds[i]);
        if (same) {
          clearAll();
        } else {
          lockedIds = ids;
          apply(lockedIds, true);
        }
      });
    });

    sl._clearLinkedHighlight = clearAll;
  });

  function clearSlide(sl) {
    if (sl && typeof sl._clearLinkedHighlight === 'function') sl._clearLinkedHighlight();
  }

  deck.stage.addEventListener('deck:slideleave', ({ detail }) => clearSlide(detail.slide));
  deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) deck.slides.forEach(clearSlide); });
})();
