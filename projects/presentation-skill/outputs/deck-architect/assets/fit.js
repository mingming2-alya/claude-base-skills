/* deck-architect v4.9 typography auto-fit
 *
 * Supports:
 *  - [data-fit="phrase"]  : auto-wraps CJK punctuation clauses into .ph if absent, then shrinks cleanly
 *  - [data-fit="figure"]  : uniform shrink for big KPI numbers inside [data-fit-group="figure"]
 *  - [data-fit="box"]     : auto-shrink container font-size if content overflows its fixed height/width
 *
 * Preserves author inline font-size via cached data-fit-base-px, and supports scoped per-slide fitting
 * via window.__deckFit(slideEl) to avoid full-document layout thrash during slide transitions.
 */
(function () {
  var CLAUSE_SPLIT = /(?<=[，、；：。！？,;!?])\s*/;

  function cacheBase(el) {
    if (!el.dataset.fitBasePx) {
      var cur = parseFloat(getComputedStyle(el).fontSize);
      if (cur > 0) el.dataset.fitBasePx = String(cur);
    }
    var base = parseFloat(el.dataset.fitBasePx || '0');
    if (base > 0) el.style.fontSize = base + 'px';
    return base;
  }

  function ensurePhrases(el) {
    var existing = [].slice.call(el.querySelectorAll('.ph'));
    if (existing.length) return existing;
    if (!el.hasAttribute('data-fit')) return [];
    // Only auto-split simple display text (text nodes, <mark>, <br>) so complex markup stays untouched
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 1 && n.tagName !== 'MARK' && n.tagName !== 'BR' && n.tagName !== 'SPAN') return [];
    }
    var parts = [];
    var cur = '';
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 1 && n.tagName === 'BR') {
        if (cur) { parts.push(cur); cur = ''; }
        parts.push('<br>');
      } else if (n.nodeType === 1) {
        cur += n.outerHTML;
      } else if (n.nodeType === 3) {
        var segs = n.nodeValue.split(CLAUSE_SPLIT);
        for (var j = 0; j < segs.length; j++) {
          cur += segs[j].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          if (j < segs.length - 1 && cur.trim()) {
            parts.push(cur);
            cur = '';
          }
        }
      }
    });
    if (cur) parts.push(cur);
    var nonBr = parts.filter(function (x) { return x && x !== '<br>'; });
    if (nonBr.length < 2) return [];
    el.innerHTML = parts.map(function (x) {
      return x === '<br>' ? '<br>' : '<span class="ph">' + x + '</span>';
    }).join('');
    return [].slice.call(el.querySelectorAll('.ph'));
  }

  function fitPhrases(scope) {
    var root = scope || document;
    root.querySelectorAll('[data-fit="phrase"], .key, .shock-text, .closing-text, .cover-title').forEach(function (el) {
      var phs = ensurePhrases(el);
      if (!phs.length) return;
      var base = cacheBase(el);
      if (!base) return;
      var size = base;
      function wraps() {
        var lh = parseFloat(getComputedStyle(el).lineHeight) || size * 1.2;
        return phs.some(function (p) { return p.offsetHeight > lh * 1.5; });
      }
      while (wraps() && size > base * 0.72) {
        size -= base * 0.04;
        el.style.fontSize = size.toFixed(1) + 'px';
      }
      if (wraps()) el.style.fontSize = base + 'px';
    });
  }

  function fitFigures(scope) {
    var slideList = scope && scope.classList && scope.classList.contains('slide')
      ? [scope]
      : [].slice.call((scope || document).querySelectorAll('.slide'));
    slideList.forEach(function (sl) {
      var groups = sl.querySelectorAll('[data-fit-group="figure"], .body');
      var list = groups.length ? [].slice.call(groups) : [sl];
      list.forEach(function (box) {
        var els = [].slice.call(box.querySelectorAll('[data-fit="figure"], .number .value, .stats-row .sv'));
        if (!els.length) return;
        var base = els.map(function (e) { return cacheBase(e) || 64; });
        var k = 1;
        function over() {
          return box.scrollWidth > box.clientWidth + 2 ||
            els.some(function (e) { return e.scrollWidth > e.clientWidth + 2; });
        }
        while (over() && k > 0.5) {
          k -= 0.05;
          els.forEach(function (e, i) { e.style.fontSize = (base[i] * k).toFixed(1) + 'px'; });
        }
      });
    });
  }

  function fitBoxes(scope) {
    var root = scope || document;
    root.querySelectorAll('[data-fit="box"]').forEach(function (box) {
      if (!box.clientHeight || !box.clientWidth) return;
      var base = cacheBase(box) || 24;
      var minPx = Math.max(18, parseFloat(box.dataset.fitMin || '18') || 18);
      var size = base;
      var guard = 0;
      while ((box.scrollHeight > box.clientHeight + 2 || box.scrollWidth > box.clientWidth + 2) && size > minPx && guard++ < 14) {
        size = Math.max(minPx, size * 0.94);
        box.style.fontSize = size.toFixed(1) + 'px';
      }
    });
  }

  function run(scope) {
    fitPhrases(scope);
    fitFigures(scope);
    fitBoxes(scope);
  }

  window.__deckFit = run;
  run();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { run(); });
  }
})();
