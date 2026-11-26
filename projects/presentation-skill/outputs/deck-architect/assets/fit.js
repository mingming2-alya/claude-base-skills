/* deck-architect v4.5 typography auto-fit
 *
 * Supports:
 *  - [data-fit="phrase"]  : shrink display phrases so punctuation groups stay unbroken
 *  - [data-fit="figure"]  : uniform shrink for big KPI numbers inside [data-fit-group="figure"]
 *  - [data-fit="box"]     : auto-shrink container font-size if content overflows its fixed height/width
 */
(function () {
  function fitPhrases() {
    document.querySelectorAll('[data-fit="phrase"], .key, .shock-text, .closing-text, .cover-title').forEach(function (el) {
      var phs = [].slice.call(el.querySelectorAll('.ph'));
      if (!phs.length) return;
      el.style.fontSize = '';
      var base = parseFloat(getComputedStyle(el).fontSize);
      if (!base) return;
      var size = base;
      function wraps() {
        var lh = parseFloat(getComputedStyle(el).lineHeight) || size * 1.2;
        return phs.some(function (p) { return p.offsetHeight > lh * 1.5; });
      }
      while (wraps() && size > base * 0.72) {
        size -= base * 0.04;
        el.style.fontSize = size + 'px';
      }
      if (wraps()) el.style.fontSize = '';
    });
  }

  function fitFigures() {
    document.querySelectorAll('.slide').forEach(function (sl) {
      var groups = sl.querySelectorAll('[data-fit-group="figure"], .body');
      var list = groups.length ? [].slice.call(groups) : [sl];
      list.forEach(function (box) {
        var els = [].slice.call(box.querySelectorAll('[data-fit="figure"], .number .value, .stats-row .sv'));
        if (!els.length) return;
        els.forEach(function (e) { e.style.fontSize = ''; });
        var base = els.map(function (e) { return parseFloat(getComputedStyle(e).fontSize) || 64; });
        var k = 1;
        function over() {
          return box.scrollWidth > box.clientWidth + 2 ||
            els.some(function (e) { return e.scrollWidth > e.clientWidth + 2; });
        }
        while (over() && k > 0.5) {
          k -= 0.05;
          els.forEach(function (e, i) { e.style.fontSize = (base[i] * k) + 'px'; });
        }
      });
    });
  }

  function fitBoxes() {
    document.querySelectorAll('[data-fit="box"]').forEach(function (box) {
      if (!box.clientHeight || !box.clientWidth) return;
      box.style.fontSize = '';
      var base = parseFloat(getComputedStyle(box).fontSize) || 24;
      var minPx = Math.max(18, parseFloat(box.dataset.fitMin || '18') || 18);
      var size = base;
      var guard = 0;
      while ((box.scrollHeight > box.clientHeight + 2 || box.scrollWidth > box.clientWidth + 2) && size > minPx && guard++ < 14) {
        size = Math.max(minPx, size * 0.94);
        box.style.fontSize = size.toFixed(1) + 'px';
      }
    });
  }

  function run() {
    fitPhrases();
    fitFigures();
    fitBoxes();
  }

  window.__deckFit = run;
  run();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run);
  }
})();
