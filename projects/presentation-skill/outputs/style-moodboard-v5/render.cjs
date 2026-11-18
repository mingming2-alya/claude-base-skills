// Render each src/*.html (1920x1080) to img/<name>.jpg. Usage: node render.cjs [name-substring ...]
const { chromium } = require('playwright');
const { readdirSync } = require('node:fs');

const path = require('node:path');

const here = __dirname;
const filters = process.argv.slice(2);
(async () => {
const files = readdirSync(path.join(here, 'src'))
  .filter(f => f.endsWith('.html'))
  .filter(f => !filters.length || filters.some(s => f.includes(s)))
  .sort();
// Google Fonts load through the session proxy when one is configured.
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch(proxy ? { proxy } : {});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
for (const f of files) {
  await page.goto('file://' + path.join(here, 'src', f), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const issues = await page.evaluate(() => {
    const out = [];
    const slide = document.querySelector('.slide').getBoundingClientRect();
    for (const el of document.querySelectorAll('[data-check] , h1, h2, h3, p, li, .t')) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      if (r.left < slide.left - 1 || r.right > slide.right + 1 || r.top < slide.top - 1 || r.bottom > slide.bottom + 1)
        out.push('outside: ' + el.textContent.trim().slice(0, 20));
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible')
        out.push('overflow: ' + el.textContent.trim().slice(0, 20));
    }
    const missing = [...document.fonts].filter(x => x.status === 'error').map(x => x.family);
    if (missing.length) out.push('font errors: ' + [...new Set(missing)].join(', '));
    return out;
  });
  const out = path.join(here, 'img', f.replace('.html', '.jpg'));
  await page.screenshot({ path: out, type: 'jpeg', quality: 90 });
  console.log(f, issues.length ? issues.join(' | ') : 'ok');
}
// With no filter, also rebuild the ten-up overview sheet from the fresh JPGs.
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
