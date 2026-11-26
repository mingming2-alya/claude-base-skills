/* deck-architect v4.5 On-Demand Module: code-stage
 *  - Zero-dependency lightweight syntax highlighter ([data-code-stage])
 *  - Line spotlighting via data-highlight-lines="1-3,6" or step-synced data-step-lines="0:1-2; 1:3-5; 2:6-8"
 *  - Optional terminal typewriter ([data-typewriter]) that snaps full text in ?still=1 / print
 */
(function () {
  const deck = window.__deck;
  if (!deck || !deck.stage) return;

  const KW = new Set([
    'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'def', 'default',
    'delete', 'elif', 'else', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function',
    'if', 'import', 'in', 'interface', 'let', 'new', 'None', 'null', 'pass', 'return', 'SELECT',
    'FROM', 'WHERE', 'JOIN', 'GROUP', 'ORDER', 'BY', 'LIMIT', 'static', 'switch', 'this', 'throw',
    'true', 'True', 'False', 'try', 'type', 'typeof', 'var', 'while', 'with', 'yield',
  ]);

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightLine(raw) {
    const tokenRe = /(\/\/.*$|#.*$|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b(?=\s*\()|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
    let out = '';
    let last = 0;
    let m;
    while ((m = tokenRe.exec(raw)) !== null) {
      if (m.index > last) out += escHtml(raw.slice(last, m.index));
      const tok = m[0];
      if (tok.startsWith('//') || tok.startsWith('#')) {
        out += '<span class="tok-cm">' + escHtml(tok) + '</span>';
      } else if (tok[0] === "'" || tok[0] === '"' || tok[0] === '`') {
        out += '<span class="tok-str">' + escHtml(tok) + '</span>';
      } else if (/^\d/.test(tok)) {
        out += '<span class="tok-num">' + escHtml(tok) + '</span>';
      } else if (KW.has(tok)) {
        out += '<span class="tok-kw">' + escHtml(tok) + '</span>';
      } else if (raw.slice(m.index + tok.length).match(/^\s*\(/)) {
        out += '<span class="tok-fn">' + escHtml(tok) + '</span>';
      } else {
        out += escHtml(tok);
      }
      last = m.index + tok.length;
    }
    if (last < raw.length) out += escHtml(raw.slice(last));
    return out || '&nbsp;';
  }

  function parseLineSpec(spec) {
    const set = new Set();
    if (!spec) return set;
    for (const part of String(spec).split(',')) {
      const t = part.trim();
      if (!t) continue;
      const r = t.match(/^(\d+)\s*-\s*(\d+)$/);
      if (r) {
        const a = parseInt(r[1], 10), b = parseInt(r[2], 10);
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) set.add(i);
      } else if (/^\d+$/.test(t)) {
        set.add(parseInt(t, 10));
      }
    }
    return set;
  }

  function parseStepMap(raw) {
    const map = new Map();
    if (!raw) return map;
    for (const seg of String(raw).split(';')) {
      const m = seg.trim().match(/^(\d+)\s*:\s*(.*)$/);
      if (m) map.set(parseInt(m[1], 10), parseLineSpec(m[2]));
    }
    return map;
  }

  const stages = [];

  document.querySelectorAll('[data-code-stage]').forEach(box => {
    const codeEl = box.querySelector('code') || box.querySelector('pre');
    if (!codeEl) return;
    const rawText = codeEl.textContent.replace(/^\n/, '').replace(/\n\s*$/, '');
    const lines = rawText.split('\n');
    const title = box.dataset.title || box.dataset.lang || '';

    if (title && !box.querySelector('.cs-head')) {
      const head = document.createElement('div');
      head.className = 'cs-head';
      head.innerHTML = '<span class="cs-dots"><i></i><i></i><i></i></span><span>' + escHtml(title) + '</span>';
      box.prepend(head);
    }

    const pre = box.querySelector('pre') || document.createElement('pre');
    pre.innerHTML = lines.map((ln, i) =>
      '<span class="cs-line" data-line="' + (i + 1) + '"><span class="cs-ln">' + (i + 1) + '</span><span class="cs-txt">' + highlightLine(ln) + '</span></span>'
    ).join('');
    if (!pre.parentNode) box.appendChild(pre);

    const lineEls = [...pre.querySelectorAll('.cs-line')];
    const staticSpec = parseLineSpec(box.dataset.highlightLines || '');
    const stepMap = parseStepMap(box.dataset.stepLines || '');

    function applyHighlight(lineSet) {
      const has = lineSet && lineSet.size > 0;
      box.classList.toggle('has-focus', has);
      lineEls.forEach((el, i) => {
        el.classList.toggle('is-hl', has && lineSet.has(i + 1));
      });
    }

    function syncStep(stepIdx) {
      if (stepMap.size) {
        if (stepMap.has(stepIdx)) applyHighlight(stepMap.get(stepIdx));
        else applyHighlight(staticSpec);
      } else {
        applyHighlight(staticSpec);
      }
    }

    syncStep(0);
    const api = { box, slide: box.closest('.slide'), syncStep, applyHighlight };
    box._codeStage = api;
    stages.push(api);
  });

  // Optional terminal typewriter ([data-typewriter])
  const twTimers = new Set();
  const typewriters = [...document.querySelectorAll('[data-typewriter]')].map(el => {
    const full = el.textContent;
    el.dataset.twFull = full;
    return { el, full, slide: el.closest('.slide'), speed: Math.max(12, parseInt(el.dataset.twSpeed || '28', 10) || 28) };
  });

  function stopTypewriters(snapFull) {
    twTimers.forEach(id => clearTimeout(id));
    twTimers.clear();
    typewriters.forEach(tw => {
      tw.el.classList.remove('is-typing');
      if (snapFull) tw.el.textContent = tw.full;
    });
  }

  function runTypewritersFor(sl, staticMode) {
    stopTypewriters(true);
    if (!sl || staticMode) return;
    typewriters.forEach(tw => {
      if (tw.slide !== sl) return;
      tw.el.textContent = '';
      tw.el.classList.add('is-typing');
      let pos = 0;
      const tick = () => {
        if (deck.isStatic() || deck.slides[deck.index] !== sl) {
          tw.el.textContent = tw.full;
          tw.el.classList.remove('is-typing');
          return;
        }
        pos++;
        tw.el.textContent = tw.full.slice(0, pos);
        if (pos < tw.full.length) {
          const id = setTimeout(() => { twTimers.delete(id); tick(); }, tw.speed);
          twTimers.add(id);
        } else {
          tw.el.classList.remove('is-typing');
        }
      };
      const initId = setTimeout(() => { twTimers.delete(initId); tick(); }, 220);
      twTimers.add(initId);
    });
  }

  deck.stage.addEventListener('deck:slideenter', ({ detail }) => {
    stages.forEach(s => { if (s.slide === detail.slide) s.syncStep(detail.step || 0); });
    runTypewritersFor(detail.slide, detail.staticMode);
  });
  deck.stage.addEventListener('deck:stepchange', ({ detail }) => {
    stages.forEach(s => { if (s.slide === detail.slide) s.syncStep(detail.step || 0); });
  });
  deck.stage.addEventListener('deck:slideleave', () => stopTypewriters(true));
  deck.stage.addEventListener('deck:still', ({ detail }) => { if (detail.still) stopTypewriters(true); });
  deck.stage.addEventListener('deck:lowpower', ({ detail }) => { if (detail.lowPower) stopTypewriters(true); });

  if (deck.slides[deck.index]) {
    stages.forEach(s => { if (s.slide === deck.slides[deck.index]) s.syncStep(deck.stepIndex || 0); });
    runTypewritersFor(deck.slides[deck.index], deck.isStatic());
  }
})();
