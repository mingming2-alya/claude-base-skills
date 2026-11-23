#!/usr/bin/env node
/**
 * Unified quality checker for deck-architect v4.
 *
 * Usage:
 *   node check.mjs path/to/deck.html [--pdf] [--jpg]
 *   node check.mjs path/to/single-slide.html [--out path/to/img.jpg]
 *   node check.mjs --sheet path/to/samples_dir
 *
 * Checks every slide (or every sample in --sheet):
 *   - Bounds & overflow on the 1920x1080 canvas
 *   - Minimum font size (<18px) & font load status
 *   - Title vs summary hierarchy (main title must be >= summary font size)
 *   - Duplicate SVG IDs within a slide
 *   - Broken <img> elements & JS console/page errors
 *   - Pixel-accurate WCAG contrast against what is ACTUALLY painted behind every
 *     text run (10th/90th percentile background luminance; 3:1 at >=24px or >=18.66px bold,
 *     4.5:1 below), including gradient-filled text stops.
 *
 * Browser backend: uses Playwright when installed; otherwise falls back automatically
 * to a zero-dependency Chromium CDP driver (Node 22+ built-in WebSocket + system Chromium).
 */
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const require = createRequire(import.meta.url);

// ----------------------------------------------------------------------------- browser abstraction
function findChromium() {
  const candidates = [
    process.env.CHROMIUM_PATH,
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function createPlaywrightDriver() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    return null;
  }
  const opts = {};
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH;
  if (process.env.HTTPS_PROXY) opts.proxy = { server: process.env.HTTPS_PROXY };
  const browser = await chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  return {
    name: 'playwright',
    clearErrors() { errors.length = 0; },
    getErrors() { return [...errors]; },
    async setViewport(width, height) { await page.setViewportSize({ width, height }); },
    async goto(url) {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => page.goto(url, { waitUntil: 'load' }));
      await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve()).catch(() => {});
      await page.waitForTimeout(250);
    },
    async evaluate(fn, arg) { return page.evaluate(fn, arg); },
    async addTempStyle(css, id) {
      await page.evaluate(({ css, id }) => {
        let el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
        el.textContent = css;
      }, { css, id });
    },
    async removeTempStyle(id) {
      await page.evaluate(id => { const el = document.getElementById(id); if (el) el.remove(); }, id);
    },
    async wait(ms) { await page.waitForTimeout(ms); },
    async screenshot({ outPath, type = 'png', quality, fullPage = false }) {
      const o = { type, fullPage };
      if (type === 'jpeg' && quality) o.quality = quality;
      if (outPath) o.path = outPath;
      return page.screenshot(o);
    },
    async pdf(outPath) {
      await page.emulateMedia({ media: 'print' });
      await page.pdf({ path: outPath, width: '1920px', height: '1080px', printBackground: true });
    },
    async close() { await browser.close(); },
  };
}

async function createCdpDriver() {
  const bin = findChromium();
  if (!bin) {
    throw new Error('找不到 Playwright 也找不到系統 Chromium（請設定 CHROMIUM_PATH 或安裝 playwright）。');
  }
  const args = [
    '--headless=new',
    '--remote-debugging-port=0',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    '--hide-scrollbars',
    '--window-size=1920,1080',
    '--force-device-scale-factor=1',
    '--allow-file-access-from-files',
  ];
  if (process.env.HTTPS_PROXY) args.push(`--proxy-server=${process.env.HTTPS_PROXY}`);
  args.push('about:blank');

  const proc = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => reject(new Error('啟動 Chromium 逾時：\n' + buf)), 15000);
    proc.stderr.on('data', chunk => {
      buf += chunk.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) { clearTimeout(timer); resolve(m[1]); }
    });
    proc.on('exit', code => { clearTimeout(timer); reject(new Error(`Chromium 意外結束 (${code})：\n` + buf)); });
  });

  // Open a page target via DevTools HTTP endpoint
  const httpBase = wsUrl.replace(/^ws:/, 'http:').replace(/\/devtools\/browser\/.*$/, '');
  const listRes = await fetch(`${httpBase}/json/list`);
  const targets = await listRes.json();
  const target = targets.find(t => t.type === 'page') || targets[0];
  if (!target?.webSocketDebuggerUrl) throw new Error('無法取得 Chromium page WebSocket');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let seq = 0;
  const pending = new Map();
  const listeners = new Map();
  const errors = [];

  ws.addEventListener('message', ev => {
    const msg = JSON.parse(String(ev.data));
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) {
      if (msg.method === 'Runtime.exceptionThrown') {
        const d = msg.params?.exceptionDetails;
        errors.push(d?.exception?.description || d?.text || 'Runtime exception');
      } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') {
        errors.push((msg.params.args || []).map(a => a.value ?? a.description ?? '').join(' '));
      }
      const fns = listeners.get(msg.method);
      if (fns) fns.forEach(fn => fn(msg.params));
    }
  });

  function send(method, params = {}) {
    const id = ++seq;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  function onceEvent(method, timeoutMs = 15000) {
    return new Promise(resolve => {
      const timer = setTimeout(() => { off(); resolve(null); }, timeoutMs);
      const handler = p => { clearTimeout(timer); off(); resolve(p); };
      const off = () => {
        const arr = listeners.get(method);
        if (arr) listeners.set(method, arr.filter(x => x !== handler));
      };
      listeners.set(method, [...(listeners.get(method) || []), handler]);
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  return {
    name: 'chromium-cdp',
    clearErrors() { errors.length = 0; },
    getErrors() { return [...errors]; },
    async setViewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    },
    async goto(url) {
      const loaded = onceEvent('Page.loadEventFired', 20000);
      await send('Page.navigate', { url });
      await loaded;
      await this.evaluate(() => document.fonts ? document.fonts.ready.then(() => true) : true).catch(() => {});
      await sleep(300);
    },
    async evaluate(fn, arg) {
      const expr = arg === undefined
        ? `(${fn.toString()})()`
        : `(${fn.toString()})(${JSON.stringify(arg)})`;
      const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
      }
      return res.result?.value;
    },
    async addTempStyle(css, id) {
      await this.evaluate(({ css, id }) => {
        let el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
        el.textContent = css;
      }, { css, id });
    },
    async removeTempStyle(id) {
      await this.evaluate(id => { const el = document.getElementById(id); if (el) el.remove(); }, id);
    },
    async wait(ms) { await sleep(ms); },
    async screenshot({ outPath, type = 'png', quality, fullPage = false }) {
      const params = { format: type === 'jpeg' ? 'jpeg' : 'png' };
      if (type === 'jpeg' && quality) params.quality = quality;
      if (fullPage) {
        const m = await send('Page.getLayoutMetrics');
        const cs = m.cssContentSize || m.contentSize;
        params.clip = { x: 0, y: 0, width: Math.ceil(cs.width), height: Math.ceil(cs.height), scale: 1 };
        params.captureBeyondViewport = true;
      }
      const { data } = await send('Page.captureScreenshot', params);
      const buf = Buffer.from(data, 'base64');
      if (outPath) fs.writeFileSync(outPath, buf);
      return buf;
    },
    async pdf(outPath) {
      await send('Emulation.setEmulatedMedia', { media: 'print' });
      const { data } = await send('Page.printToPDF', {
        paperWidth: 1920 / 96,
        paperHeight: 1080 / 96,
        marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
        printBackground: true,
      });
      fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
      await send('Emulation.setEmulatedMedia', { media: 'screen' });
    },
    async close() {
      try { ws.close(); } catch {}
      try { proc.kill('SIGTERM'); } catch {}
    },
  };
}

async function openDriver() {
  const pw = await createPlaywrightDriver();
  return pw || createCdpDriver();
}

// ----------------------------------------------------------------------------- color & contrast helpers
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

function parseColorStops(bgImage) {
  const stops = [];
  if (!bgImage || !bgImage.includes('gradient')) return stops;
  for (const m of bgImage.matchAll(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/g)) {
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    if (a >= 0.4) stops.push([+m[1], +m[2], +m[3]]);
  }
  for (const m of bgImage.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    let h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    stops.push([parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]);
  }
  return stops;
}

// ----------------------------------------------------------------------------- slide inspection
async function auditCurrentSlide(driver, shotPath, shotType = 'png') {
  await driver.evaluate(() => { if (typeof window.__deckFit === 'function') window.__deckFit(); }).catch(() => {});
  await driver.wait(120);

  const meta = await driver.evaluate(() => {
    const sl = document.querySelector('.slide.active') || document.querySelector('.slide');
    if (!sl) return { missing: true };
    const sr = sl.getBoundingClientRect();
    const scale = sr.width ? sr.width / 1920 : 1;
    const issues = [];
    const warnings = [];

    // 1. Duplicate IDs inside SVGs of the active slide
    const seenIds = new Set();
    const dupIds = new Set();
    for (const svg of sl.querySelectorAll('svg')) {
      for (const node of svg.querySelectorAll('[id]')) {
        const id = node.getAttribute('id');
        if (!id) continue;
        if (seenIds.has(id)) dupIds.add(id);
        seenIds.add(id);
      }
    }
    if (dupIds.size) issues.push(`SVG 內有重複 id：${[...dupIds].join(', ')}`);

    // 2. Broken images
    for (const img of sl.querySelectorAll('img')) {
      if (!img.complete || !img.naturalWidth) {
        issues.push(`圖片載入失敗：${(img.getAttribute('src') || '').slice(0, 40)}`);
      }
    }

    // 3. Font errors (warning when offline)
    const badFonts = [...(document.fonts || [])].filter(f => f.status === 'error').map(f => f.family);
    if (badFonts.length) warnings.push(`字體載入失敗（使用系統退路）：${[...new Set(badFonts)].join(', ')}`);

    // 4. Container scroll overflow
    for (const el of sl.querySelectorAll('.cover-inner, .shock-inner, .closing-inner, .pillars, .st-body, [data-check-box]')) {
      if (el.scrollHeight > el.clientHeight + 3 || el.scrollWidth > el.clientWidth + 3) {
        issues.push(`區塊內容溢出（${el.className || el.tagName}）：${el.scrollWidth}x${el.scrollHeight} / ${el.clientWidth}x${el.clientHeight}`);
      }
    }

    // 5. Title vs summary hierarchy check (Principle: 總結永遠不當主標題)
    const kind = sl.dataset.kind || 'content';
    if (kind === 'content' && !sl.classList.contains('overview')) {
      const titleEl = sl.querySelector('[data-role="title"], header.slide-head .title, .copy h2, h2.title');
      const sumEl = sl.querySelector('[data-role="summary"], .copy .key, .stats-lead, .point .key');
      if (titleEl && sumEl && titleEl !== sumEl) {
        const tfs = parseFloat(getComputedStyle(titleEl).fontSize) / scale;
        const sfs = parseFloat(getComputedStyle(sumEl).fontSize) / scale;
        if (sfs > tfs + 1) {
          issues.push(`總結字級（${sfs.toFixed(0)}px）大於主標題（${tfs.toFixed(0)}px）：主標題必須是頁面上最大的題目字`);
        }
      }
    }

    // 6. Collect visible text runs + bounds & min font size
    const runs = [];
    const seenBounds = new Set();
    const seenSmall = new Set();
    const walker = document.createTreeWalker(sl, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode;
      const txt = t.textContent.trim();
      if (!txt) continue;
      const el = t.parentElement;
      if (!el || el.closest('style,script,title,defs,[aria-hidden="true"],.toc li.off,.snav')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) continue;

      const fs = parseFloat(cs.fontSize) / scale;
      const fw = parseInt(cs.fontWeight, 10) || 400;
      const isFinePrint = Boolean(el.closest('.source,.pageno,.foot,[data-role="source"],figcaption,small'));
      if (fs < (isFinePrint ? 16 : 18) && !seenSmall.has(txt.slice(0, 14))) {
        seenSmall.add(txt.slice(0, 14));
        issues.push(`文字太小（${fs.toFixed(0)}px）：「${txt.slice(0, 18)}」`);
      }

      const range = document.createRange();
      range.selectNodeContents(t);
      const rects = [...range.getClientRects()].filter(r => r.width > 1.5 && r.height > 1.5);
      for (const r of rects) {
        // Trim CJK font ascent/descent box padding for fair boundary check
        const lh = parseFloat(cs.lineHeight) || fs * 1.2 * scale;
        const trim = Math.max(0, fs * scale * 1.4 - lh) / 2;
        const top = r.top + trim, bot = r.bottom - trim;
        if (
          !el.closest('[data-bleed], svg.scene, .asset-slot') &&
          (r.left < sr.left - 3 || r.right > sr.right + 3 || top < sr.top - 3 || bot > sr.bottom + 3)
        ) {
          const key = txt.slice(0, 16);
          if (!seenBounds.has(key)) {
            seenBounds.add(key);
            issues.push(`文字超出畫面：「${key}」`);
          }
        }

        // Color / gradient extraction
        const isSvg = el instanceof SVGElement;
        const clip = cs.webkitBackgroundClip || cs.backgroundClip || '';
        const fillCol = isSvg ? cs.fill : (cs.webkitTextFillColor || cs.color);
        const m = (fillCol || '').match(/[\d.]+/g);
        const alpha = m && m.length > 3 ? parseFloat(m[3]) : 1;
        const isGrad = !isSvg && clip.includes('text') && alpha < 0.2 && (cs.backgroundImage || '').includes('gradient');
        if (isGrad) {
          el.classList.add('__check_hide_grad');
          runs.push({
            text: txt.slice(0, 14), x: r.left, y: r.top, w: r.width, h: r.height,
            size: fs, weight: fw, gradient: cs.backgroundImage, rgb: null,
          });
        } else if (m && alpha >= 0.4) {
          runs.push({
            text: txt.slice(0, 14), x: r.left, y: r.top, w: r.width, h: r.height,
            size: fs, weight: fw, gradient: null, rgb: m.slice(0, 3).map(Number),
          });
        }
      }
    }

    // Collect replaceable asset slots (info only)
    const slots = [...sl.querySelectorAll('[data-slot]')].map(e => e.getAttribute('data-slot'));

    return { missing: false, kind, issues, warnings, runs, slots };
  });

  if (meta.missing) return { kind: 'none', issues: ['找不到 .slide 元素'], warnings: [], minContrast: 0, runs: 0, slots: [] };

  // Capture normal screenshot before hiding text
  if (shotPath) {
    await driver.screenshot({ outPath: shotPath, type: shotType, quality: shotType === 'jpeg' ? 90 : undefined });
  }

  // Pixel-accurate WCAG contrast: hide all text, screenshot actual painted background, sample behind every run
  const hideCss = [
    '.slide, .slide * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }',
    '.slide svg text, .slide svg tspan { fill: transparent !important; stroke: transparent !important; }',
    '.slide .__check_hide_grad { opacity: 0 !important; }',
  ].join('\n');
  await driver.addTempStyle(hideCss, '__check_hide_text');
  await driver.wait(80);
  const bgBuf = await driver.screenshot({ type: 'png' });
  await driver.removeTempStyle('__check_hide_text');
  await driver.evaluate(() => document.querySelectorAll('.__check_hide_grad').forEach(e => e.classList.remove('__check_hide_grad'))).catch(() => {});

  const bgB64 = bgBuf.toString('base64');
  const sampled = await driver.evaluate(async ({ bgB64, runs }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + bgB64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || 1920;
    c.height = img.naturalHeight || 1080;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return runs.map(r => {
      const x = Math.max(0, Math.floor(r.x + r.w * 0.02));
      const y = Math.max(0, Math.floor(r.y + r.h * 0.18));
      const w = Math.min(c.width - x, Math.ceil(r.w * 0.96));
      const h = Math.min(c.height - y, Math.ceil(r.h * 0.64));
      if (w <= 0 || h <= 0) return null;
      const d = ctx.getImageData(x, y, w, h).data;
      const ls = [];
      const step = Math.max(4, Math.floor(d.length / 4000) * 4);
      for (let i = 0; i < d.length; i += step) {
        ls.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]));
      }
      if (!ls.length) return null;
      ls.sort((a, b) => a - b);
      return [ls[Math.floor(ls.length * 0.1)], ls[Math.floor(ls.length * 0.9)]];
    });
  }, { bgB64, runs: meta.runs });

  let worst = Infinity;
  const contrastIssues = new Set();
  meta.runs.forEach((r, i) => {
    const bgL = sampled[i];
    if (!bgL) return;
    const need = (r.size >= 24 || (r.size >= 18.66 && r.weight >= 700)) ? 3.0 : 4.5;
    if (r.gradient) {
      const stops = parseColorStops(r.gradient);
      if (!stops.length) return;
      let gWorst = Infinity;
      for (const rgb of stops) {
        const lt = lum(rgb);
        gWorst = Math.min(gWorst, ratio(lt, bgL[0]), ratio(lt, bgL[1]));
      }
      worst = Math.min(worst, gWorst);
      if (gWorst < need) {
        contrastIssues.add(`漸層字對比不足（${gWorst.toFixed(2)}:1，需 ${need}:1，${r.size.toFixed(0)}px）：「${r.text}」`);
      }
    } else if (r.rgb) {
      const lt = lum(r.rgb);
      const cr = Math.min(ratio(lt, bgL[0]), ratio(lt, bgL[1]));
      worst = Math.min(worst, cr);
      if (cr < need) {
        contrastIssues.add(`對比不足（${cr.toFixed(2)}:1，需 ${need}:1，${r.size.toFixed(0)}px）：「${r.text}」`);
      }
    }
  });

  const issues = [...new Set([...meta.issues, ...[...contrastIssues].slice(0, 6)])];
  return {
    kind: meta.kind,
    issues,
    warnings: meta.warnings,
    minContrast: Number.isFinite(worst) ? worst : 0,
    runs: meta.runs.length,
    slots: meta.slots,
  };
}

// ----------------------------------------------------------------------------- modes
async function runSheetMode(driver, samplesDir) {
  const dir = path.resolve(samplesDir);
  const imgDir = path.join(dir, 'img');
  fs.mkdirSync(imgDir, { recursive: true });
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'sheet.html').sort();
  if (!files.length) throw new Error(`${dir} 裡沒有可檢查的樣張 HTML`);

  const report = [`# 樣張品質報告：${path.basename(dir)}`, '', `後端：${driver.name}｜共 ${files.length} 張樣張。`, ''];
  let failed = 0;

  await driver.setViewport(1920, 1080);
  for (const f of files) {
    driver.clearErrors();
    await driver.goto(pathToFileURL(path.join(dir, f)).href);
    const shotPath = path.join(imgDir, f.replace(/\.html$/, '.jpg'));
    const res = await auditCurrentSlide(driver, shotPath, 'jpeg');
    const jsErrs = driver.getErrors();
    if (jsErrs.length) res.issues.push(...jsErrs.map(e => `腳本錯誤：${e}`));
    const status = res.issues.length ? 'FAIL' : 'OK';
    if (res.issues.length) failed++;
    console.log(`${f.padEnd(28)} ${status}  (min contrast ${res.minContrast.toFixed(2)}, ${res.runs} runs)${res.issues.length ? ' | ' + res.issues.join(' ; ') : ''}`);
    report.push(`- **${f}**（${status}，最低對比 ${res.minContrast.toFixed(2)}:1，${res.runs} 段文字）`);
    for (const x of res.issues) report.push(`  - [ERROR] ${x}`);
    for (const w of res.warnings) report.push(`  - [WARN] ${w}`);
  }

  const sheetHtml = path.join(dir, 'sheet.html');
  if (fs.existsSync(sheetHtml)) {
    await driver.setViewport(2000, 200);
    await driver.goto(pathToFileURL(sheetHtml).href);
    const sheetJpg = path.join(dir, 'sheet.jpg');
    await driver.screenshot({ outPath: sheetJpg, type: 'jpeg', quality: 88, fullPage: true });
    console.log(`sheet.jpg                    OK`);
    report.push('', `已輸出總覽：\`${sheetJpg}\``);
  }

  fs.writeFileSync(path.join(dir, 'check-report.md'), report.join('\n') + '\n');
  return failed > 0 ? 1 : 0;
}

async function runMotionAudit(driver, filePath) {
  const results = [];
  const failures = [];
  driver.clearErrors();
  await driver.setViewport(1920, 1080);
  await driver.goto(pathToFileURL(filePath).href);
  await driver.wait(280);

  const count = await driver.evaluate(() => window.__deck ? window.__deck.count : 0);
  if (!count) return { results: [], failures: ['找不到 window.__deck API'] };

  // 1. Rapid-fire zero-lockout interruption test
  const mainCount = await driver.evaluate(() => window.__deck.slides.filter(s => s.dataset.appendix !== '1').length);
  if (mainCount >= 4) {
    await driver.evaluate(() => window.__deck.go(0, true));
    await driver.wait(80);
    for (let k = 0; k < 4; k++) {
      await driver.evaluate(() => window.__deck.step(1));
      await driver.wait(45);
    }
    await driver.wait(1050);
    const rapid = await driver.evaluate(() => {
      const idx = window.__deck.index;
      const morphLeft = document.getElementById('morph-layer')?.children.length || 0;
      const hiddenMorph = [...document.querySelectorAll('[data-morph]')].filter(e => e.style.visibility === 'hidden').length;
      const actives = document.querySelectorAll('.slide.active').length;
      const leavings = document.querySelectorAll('.slide.leaving').length;
      return { idx, morphLeft, hiddenMorph, actives, leavings };
    });
    if (rapid.idx >= 3 && rapid.morphLeft === 0 && rapid.hiddenMorph === 0 && rapid.actives === 1 && rapid.leavings === 0) {
      results.push(`連按打斷測試（4 次／180ms）：通過（精準落於第 ${rapid.idx + 1} 頁，無殘留 clone 與鎖死）`);
    } else {
      failures.push(`連按打斷異常：index=${rapid.idx}, morphLeft=${rapid.morphLeft}, hiddenMorph=${rapid.hiddenMorph}, actives=${rapid.actives}, leavings=${rapid.leavings}`);
    }
  }

  // 2. Magic Move mount & cleanup round-trip
  const morphPair = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    for (let i = 0; i < sls.length - 1; i++) {
      if (sls[i].dataset.appendix === '1' || sls[i + 1].dataset.appendix === '1') continue;
      const aIds = new Set([...sls[i].querySelectorAll('[data-morph]')].map(e => e.dataset.morph));
      for (const el of sls[i + 1].querySelectorAll('[data-morph]')) {
        if (aIds.has(el.dataset.morph)) return { from: i, to: i + 1, id: el.dataset.morph };
      }
    }
    return null;
  });
  if (morphPair) {
    await driver.evaluate(i => window.__deck.go(i, true), morphPair.from);
    await driver.wait(80);
    await driver.evaluate(i => window.__deck.go(i, false), morphPair.to);
    await driver.wait(120);
    const midCount = await driver.evaluate(() => document.getElementById('morph-layer')?.children.length || 0);
    await driver.wait(1000);
    const post = await driver.evaluate(({ to, id }) => {
      const layer = document.getElementById('morph-layer')?.children.length || 0;
      const target = window.__deck.slides[to].querySelector(`[data-morph="${id}"]`);
      const vis = target ? getComputedStyle(target).visibility : 'missing';
      return { layer, vis };
    }, morphPair);
    // Test backward Magic Move too
    await driver.evaluate(i => window.__deck.go(i, false), morphPair.from);
    await driver.wait(1050);
    const backPost = await driver.evaluate(() => document.getElementById('morph-layer')?.children.length || 0);
    if (midCount > 0 && post.layer === 0 && post.vis === 'visible' && backPost === 0) {
      results.push(`跨頁 Magic Move（第 ${morphPair.from + 1} ↔ ${morphPair.to + 1} 頁 \`${morphPair.id}\`）：通過（飛行中 clone=${midCount}，落地清理完整）`);
    } else {
      failures.push(`Magic Move 異常：mid=${midCount}, postLayer=${post.layer}, vis=${post.vis}, backLayer=${backPost}`);
    }
  }

  // 3. Interactive live-figure slider isolation & recalculation
  const liveInfo = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    for (let i = 0; i < sls.length; i++) {
      const rng = sls[i].querySelector('.live-ctrl input[type="range"]');
      if (rng) return { idx: i };
    }
    return null;
  });
  if (liveInfo) {
    await driver.evaluate(i => window.__deck.go(i, true), liveInfo.idx);
    await driver.wait(120);
    const liveRes = await driver.evaluate(i => {
      const sl = window.__deck.slides[i];
      const rng = sl.querySelector('.live-ctrl input[type="range"]');
      const beforeText = sl.innerText;
      const origVal = rng.value;
      rng.click();
      const idxAfterClick = window.__deck.index;
      const min = Number(rng.min || 0), max = Number(rng.max || 100);
      rng.value = String(Number(origVal) === max ? min : max);
      rng.dispatchEvent(new Event('input', { bubbles: true }));
      const afterText = sl.innerText;
      rng.value = origVal;
      rng.dispatchEvent(new Event('input', { bubbles: true }));
      return { idxAfterClick, expected: i, changed: beforeText !== afterText };
    }, liveInfo.idx);
    if (liveRes.idxAfterClick === liveRes.expected && liveRes.changed) {
      results.push(`現場互動試算（第 ${liveInfo.idx + 1} 頁滑桿）：通過（點擊不誤翻頁、即時重算數值）`);
    } else {
      failures.push(`互動試算異常：idxAfterClick=${liveRes.idxAfterClick} (預期 ${liveRes.expected}), changed=${liveRes.changed}`);
    }
  }

  // 4. Low-power static freeze toggle (B key API)
  const lpRes = await driver.evaluate(() => {
    const on = window.__deck.toggleLowPower(true);
    const clsOn = document.body.classList.contains('low-power');
    const stOn = window.__deck.isStatic();
    const off = window.__deck.toggleLowPower(false);
    const clsOff = document.body.classList.contains('low-power');
    return { on, clsOn, stOn, off, clsOff };
  });
  if (lpRes.on && lpRes.clsOn && lpRes.stOn && !lpRes.off && !lpRes.clsOff) {
    results.push('低耗電靜態凍結（B 鍵模式）：通過（開關與還原正常）');
  } else {
    failures.push(`低耗電模式異常：${JSON.stringify(lpRes)}`);
  }

  // 5. Appendix click-in & Esc/back return
  const linkInfo = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    for (let i = 0; i < sls.length; i++) {
      const btn = sls[i].querySelector('[data-link]');
      if (btn) return { idx: i, target: btn.dataset.link };
    }
    return null;
  });
  if (linkInfo) {
    await driver.evaluate(i => window.__deck.go(i, true), linkInfo.idx);
    await driver.wait(80);
    await driver.evaluate(id => window.__deck.openLink(id), linkInfo.target);
    await driver.wait(450);
    const inApp = await driver.evaluate(() => {
      const sl = window.__deck.slides[window.__deck.index];
      return { isApp: sl?.dataset.appendix === '1', id: sl?.dataset.id };
    });
    await driver.evaluate(() => window.__deck.back());
    await driver.wait(450);
    const backIdx = await driver.evaluate(() => window.__deck.index);
    if (inApp.isApp && inApp.id === linkInfo.target && backIdx === linkInfo.idx) {
      results.push(`附件點入與返回（第 ${linkInfo.idx + 1} 頁 → \`${linkInfo.target}\`）：通過`);
    } else {
      failures.push(`附件進出異常：inApp=${JSON.stringify(inApp)}, backIdx=${backIdx} (預期 ${linkInfo.idx})`);
    }
  }

  const jsErrs = driver.getErrors();
  for (const e of jsErrs) failures.push(`動態測試期間腳本錯誤：${e}`);
  return { results, failures };
}

async function runDeckOrSingleMode(driver, targetFile, opts) {
  const filePath = path.resolve(targetFile);
  if (!fs.existsSync(filePath)) throw new Error(`找不到檔案：${filePath}`);

  driver.clearErrors();
  await driver.setViewport(1920, 1080);
  await driver.goto(pathToFileURL(filePath).href + '?still=1');
  await driver.addTempStyle('#hint, #toast { display: none !important; }', '__check_hide_hint');

  const isDeck = await driver.evaluate(() => Boolean(window.__deck && typeof window.__deck.count === 'number'));

  if (!isDeck) {
    const outImg = opts.out ? path.resolve(opts.out) : filePath.replace(/\.html$/, opts.jpg ? '.jpg' : '.png');
    const res = await auditCurrentSlide(driver, outImg, opts.jpg ? 'jpeg' : 'png');
    const jsErrs = driver.getErrors();
    if (jsErrs.length) res.issues.push(...jsErrs.map(e => `腳本錯誤：${e}`));
    console.log(`${path.basename(filePath)}  ${res.issues.length ? 'FAIL' : 'OK'}  (min contrast ${res.minContrast.toFixed(2)}, ${res.runs} runs)`);
    for (const x of res.issues) console.log(`  - [ERROR] ${x}`);
    for (const w of res.warnings) console.log(`  - [WARN] ${w}`);
    return res.issues.length ? 1 : 0;
  }

  const outDir = path.join(path.dirname(filePath), 'check');
  fs.mkdirSync(outDir, { recursive: true });
  const count = await driver.evaluate(() => window.__deck.count);
  const problems = [];
  const allWarnings = [];
  const allSlots = [];
  let minDeckContrast = Infinity;

  for (let i = 0; i < count; i++) {
    await driver.evaluate(n => window.__deck.go(n, true), i);
    await driver.wait(120);
    const ext = opts.jpg ? 'jpg' : 'png';
    const shot = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.${ext}`);
    const res = await auditCurrentSlide(driver, shot, opts.jpg ? 'jpeg' : 'png');
    if (res.minContrast > 0) minDeckContrast = Math.min(minDeckContrast, res.minContrast);
    if (res.issues.length) problems.push({ slide: i + 1, kind: res.kind, issues: res.issues, minContrast: res.minContrast });
    if (res.warnings.length) allWarnings.push({ slide: i + 1, warnings: res.warnings });
    if (res.slots.length) allSlots.push(...res.slots.map(s => `第 ${i + 1} 頁：${s}`));
  }

  if (opts.pdf) {
    await driver.pdf(path.join(path.dirname(filePath), 'deck.pdf'));
  }

  const jsErrs = driver.getErrors();
  let motionReport = null;
  if (opts.motion) {
    motionReport = await runMotionAudit(driver, filePath);
  }

  const lines = [
    `# 品管報告：${path.basename(filePath)}`,
    '',
    `後端：${driver.name}｜共 ${count} 頁（\`?still=1\` 靜態定格實測），截圖在 \`check/\`。全簡報最低文字對比：${Number.isFinite(minDeckContrast) ? minDeckContrast.toFixed(2) + ':1' : '—'}。`,
    '',
  ];
  if (jsErrs.length) lines.push('## 主控台／腳本錯誤', ...jsErrs.map(e => `- ${e}`), '');
  if (problems.length) {
    lines.push('## 問題（需修正）');
    for (const p of problems) {
      lines.push(`- 第 ${p.slide} 頁（${p.kind}，最低對比 ${p.minContrast.toFixed(2)}:1）`);
      for (const x of p.issues) lines.push(`  - ${x}`);
    }
    lines.push('');
  } else if (!jsErrs.length) {
    lines.push('## 自動靜態檢查：全部通過', '', '接著請逐張看截圖，確認美感、去小字程度、斷行與主標題階層符合預期。', '');
  }
  if (motionReport) {
    lines.push('## 動態互動檢核（`--motion`）');
    for (const r of motionReport.results) lines.push(`- ✅ ${r}`);
    for (const f of motionReport.failures) lines.push(`- ❌ ${f}`);
    lines.push('');
  }
  if (allWarnings.length) {
    lines.push('## 提醒');
    for (const w of allWarnings) lines.push(`- 第 ${w.slide} 頁：${w.warnings.join('；')}`);
    lines.push('');
  }
  if (allSlots.length) {
    lines.push('## 可升級圖像插槽', ...allSlots.map(s => `- ${s}`), '');
  }

  const reportText = lines.join('\n');
  fs.writeFileSync(path.join(outDir, 'report.md'), reportText);
  console.log(reportText);
  const motionFailed = motionReport ? motionReport.failures.length > 0 : false;
  return (problems.length || jsErrs.length || motionFailed) ? 1 : 0;
}

// ----------------------------------------------------------------------------- CLI
async function main() {
  const argv = process.argv.slice(2);
  const sheetIdx = argv.indexOf('--sheet');
  const pdf = argv.includes('--pdf');
  const jpg = argv.includes('--jpg');
  const motion = argv.includes('--motion');
  const outIdx = argv.indexOf('--out');
  const out = outIdx >= 0 ? argv[outIdx + 1] : null;

  const driver = await openDriver();
  try {
    if (sheetIdx >= 0) {
      const dir = argv[sheetIdx + 1];
      if (!dir) { console.error('用法：node check.mjs --sheet path/to/samples_dir'); process.exit(2); }
      const code = await runSheetMode(driver, dir);
      await driver.close();
      process.exit(code);
    }
    const target = argv.find((a, idx) => !a.startsWith('--') && !(outIdx >= 0 && idx === outIdx + 1));
    if (!target) {
      console.error('用法：node check.mjs path/to/deck.html [--motion] [--pdf] [--jpg] | node check.mjs --sheet path/to/samples_dir');
      process.exit(2);
    }
    const code = await runDeckOrSingleMode(driver, target, { pdf, jpg, motion, out });
    await driver.close();
    process.exit(code);
  } catch (err) {
    await driver.close();
    console.error('[ERROR]', err.message || err);
    process.exit(2);
  }
}

main();
