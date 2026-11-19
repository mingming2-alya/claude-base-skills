// Render each src/*.html (1920x1080) to img/<name>.jpg, then check the text layer:
// boxes inside the slide, no overflow, fonts loaded, and WCAG contrast against what is
// actually painted behind every text run (3:1 at 24px and above, 4.5:1 below).
// Usage: node render.cjs [name-substring ...]
const { chromium } = require('playwright');
const { readdirSync } = require('node:fs');
const path = require('node:path');

const here = __dirname;
const filters = process.argv.slice(2);
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

(async () => {
  const files = readdirSync(path.join(here, 'src'))
    .filter(f => f.endsWith('.html'))
    .filter(f => !filters.length || filters.some(s => f.includes(s)))
    .sort();
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch(proxy ? { proxy } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  for (const f of files) {
    await page.goto('file://' + path.join(here, 'src', f), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const issues = await page.evaluate(() => {
      const out = [];
      const slide = document.querySelector('.slide').getBoundingClientRect();
      for (const el of document.querySelectorAll('h1, h2, h3, p, li, strong, span, [data-check]')) {
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (r.left < slide.left - 1 || r.right > slide.right + 1 || r.top < slide.top - 1 || r.bottom > slide.bottom + 1)
          out.push('outside: ' + el.textContent.trim().slice(0, 12));
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible')
          out.push('overflow: ' + el.textContent.trim().slice(0, 12));
      }
      const missing = [...document.fonts].filter(x => x.status === 'error').map(x => x.family);
      if (missing.length) out.push('font errors: ' + [...new Set(missing)].join(', '));
      return out;
    });
    await page.screenshot({ path: path.join(here, 'img', f.replace('.html', '.jpg')), type: 'jpeg', quality: 90 });

    // Every text run with its colour and size (SVG text uses its fill).
    const runs = await page.evaluate(() => {
      const out = [];
      const walker = document.createTreeWalker(document.querySelector('.slide'), NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode;
        if (!t.textContent.trim()) continue;
        const el = t.parentElement;
        if (el.closest('style,script,title,defs')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const col = (el instanceof SVGElement ? cs.fill : cs.webkitTextFillColor || cs.color);
        const m = (col || '').match(/[\d.]+/g);
        if (!m || (m.length > 3 && +m[3] < 0.5)) continue; // gradient-filled text is checked by hand
        const range = document.createRange(); range.selectNodeContents(t);
        for (const r of range.getClientRects())
          if (r.width > 2 && r.height > 2)
            out.push({ text: t.textContent.trim().slice(0, 10), x: r.left, y: r.top, w: r.width, h: r.height,
                       rgb: m.slice(0, 3).map(Number), size: parseFloat(cs.fontSize) });
      }
      return out;
    });
    // Paint the text away and sample what sits behind each run.
    await page.addStyleTag({ content: '.slide, .slide *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important} .slide svg text, .slide svg tspan{fill:transparent!important;stroke:transparent!important}' });
    await page.waitForTimeout(150);
    const bg = (await page.screenshot({ type: 'png' })).toString('base64');
    const stats = await page.evaluate(async ({ bg, runs }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + bg; await img.decode();
      const c = document.createElement('canvas'); c.width = 1920; c.height = 1080;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
      const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return runs.map(r => {
        // the glyphs sit in the middle of the line box: skip the ascent/descent padding
        const x = Math.max(0, Math.floor(r.x + r.w * 0.02)), y = Math.max(0, Math.floor(r.y + r.h * 0.18));
        const w = Math.min(1920 - x, Math.ceil(r.w * 0.96)), h = Math.min(1080 - y, Math.ceil(r.h * 0.64));
        if (w <= 0 || h <= 0) return null;
        const d = ctx.getImageData(x, y, w, h).data, ls = [];
        for (let i = 0; i < d.length; i += 8) ls.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]));
        ls.sort((a, b) => a - b);
        return [ls[Math.floor(ls.length * 0.1)], ls[Math.floor(ls.length * 0.9)]];
      });
    }, { bg, runs });
    let worst = Infinity;
    runs.forEach((r, i) => {
      if (!stats[i]) return;
      const lt = lum(r.rgb), cr = Math.min(ratio(lt, stats[i][0]), ratio(lt, stats[i][1]));
      worst = Math.min(worst, cr);
      if (cr < (r.size >= 24 ? 3 : 4.5)) issues.push(`contrast ${cr.toFixed(2)} ${r.size}px「${r.text}」`);
    });
    console.log(f, issues.length ? issues.join(' | ') : 'ok', `(min contrast ${worst.toFixed(2)}, ${runs.length} runs)`);
  }
  if (!filters.length) {
    const sheet = await browser.newPage({ viewport: { width: 2000, height: 800 } });
    await sheet.goto('file://' + path.join(here, 'overview.html'), { waitUntil: 'networkidle' });
    await sheet.evaluate(() => document.fonts.ready);
    await sheet.waitForTimeout(300);
    await sheet.screenshot({ path: path.join(here, 'overview.jpg'), type: 'jpeg', quality: 86, fullPage: true });
    console.log('overview.jpg ok');
  }
  await browser.close();
})();
