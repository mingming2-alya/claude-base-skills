#!/usr/bin/env node
/**
 * Quality check for a built deck: screenshots every slide and flags real problems.
 *
 * Usage: node check.mjs path/to/deck.html [--pdf]
 *
 * Writes <deck dir>/check/slide-XX.png, check/report.md, and (with --pdf) deck.pdf.
 * Flags: text overflowing its area, text smaller than 20px on the 1920x1080 canvas,
 * console errors, broken images. Exit code 1 when problems are found.
 *
 * Needs Playwright (require('playwright')). If Chromium is not found automatically,
 * set CHROMIUM_PATH to the browser binary.
 */
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { console.error('需要 Playwright：npm i -g playwright（或在已安裝的環境執行）'); process.exit(2); }

const file = process.argv.slice(2).find(a => !a.startsWith('--'));
if (!file) { console.error('用法：node check.mjs path/to/deck.html [--pdf]'); process.exit(2); }
const deckPath = path.resolve(file);
const outDir = path.join(path.dirname(deckPath), 'check');
fs.mkdirSync(outDir, { recursive: true });

const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOpts);
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push(String(e)));

await page.goto(pathToFileURL(deckPath).href);
await page.waitForFunction(() => window.__deck && document.fonts && document.fonts.status === 'loaded', null, { timeout: 15000 }).catch(() => {});
await page.addStyleTag({ content: '#hint{display:none!important}' });
const count = await page.evaluate(() => window.__deck.count);
const problems = [];

for (let i = 0; i < count; i++) {
  await page.evaluate(n => window.__deck.go(n), i);
  await page.waitForTimeout(250);
  const info = await page.evaluate(() => {
    const sl = document.querySelector('.slide.active');
    const out = { kind: sl.dataset.kind, issues: [] };
    const stage = sl.getBoundingClientRect();
    const scale = stage.width / 1920;
    // overflow: content areas must not scroll, nothing may leave the slide
    for (const el of sl.querySelectorAll('.body, .cover-inner, .shock-inner, .closing-inner')) {
      if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2)
        out.issues.push(`內容超出版面（${el.className}）：高 ${el.scrollHeight}/${el.clientHeight}`);
    }
    for (const el of sl.querySelectorAll('h1,h2,h3,p,li,span,cite,div.value,div.label')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !el.textContent.trim()) continue;
      if (r.right > stage.right + 2 || r.bottom > stage.bottom + 2 || r.left < stage.left - 2)
        out.issues.push(`文字超出畫面：「${el.textContent.trim().slice(0, 24)}」`);
      const fs = parseFloat(getComputedStyle(el).fontSize) / scale;
      if (fs < 20 && el.children.length === 0)
        out.issues.push(`文字太小（${fs.toFixed(0)}px）：「${el.textContent.trim().slice(0, 24)}」`);
    }
    for (const img of sl.querySelectorAll('img')) if (!img.complete || !img.naturalWidth)
      out.issues.push(`圖片載入失敗：${img.getAttribute('src')}`);
    out.issues = [...new Set(out.issues)];
    return out;
  });
  const name = `slide-${String(i + 1).padStart(2, '0')}.png`;
  await page.screenshot({ path: path.join(outDir, name) });
  if (info.issues.length) problems.push({ slide: i + 1, kind: info.kind, issues: info.issues });
}

if (process.argv.includes('--pdf')) {
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(path.dirname(deckPath), 'deck.pdf'), width: '1920px', height: '1080px', printBackground: true });
}
await browser.close();

const lines = [`# 品管報告：${path.basename(deckPath)}`, '', `共 ${count} 頁，截圖在 check/。`, ''];
if (consoleErrors.length) lines.push('## 主控台錯誤', ...consoleErrors.map(e => `- ${e}`), '');
if (problems.length) {
  lines.push('## 問題');
  for (const p of problems) lines.push(`- 第 ${p.slide} 頁（${p.kind}）`, ...p.issues.map(x => `  - ${x}`));
} else lines.push('## 自動檢查：沒有發現問題', '', '接著請逐張看截圖，用 references/presentation-rules.md 的品管清單檢查。');
fs.writeFileSync(path.join(outDir, 'report.md'), lines.join('\n'));
console.log(lines.join('\n'));
process.exit(problems.length || consoleErrors.length ? 1 : 0);
