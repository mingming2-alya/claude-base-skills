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

// Signature motion primitives of a style, from the single style × motion database.
function loadStyleDna(styleId) {
  if (!styleId) return null;
  try {
    const idx = JSON.parse(fs.readFileSync(new URL('../styles/index.json', import.meta.url), 'utf8'));
    const st = (idx.styles || []).find(s => String(s.id).toLowerCase() === styleId);
    if (!st) return null;
    return { status: st.status, signature: (st.motion_dna && st.motion_dna.signature_motions) || [] };
  } catch {
    return null;
  }
}

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
  const notices = [];
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const url = (typeof m.location === 'function' && m.location()?.url) || '';
    // Offline or firewalled: Google Fonts cannot load. The shell has a built-in system-font
    // fallback, so this is a notice, not a failure.
    if (/^Failed to load resource/.test(m.text()) && /fonts\.(googleapis|gstatic)\.com/.test(url)) {
      if (!notices.length) notices.push('網路受限時載不到 Google Fonts，已由系統字體頂替（底盤內建退路，不算錯誤）。');
      return;
    }
    errors.push(m.text());
  });
  page.on('pageerror', e => errors.push(String(e)));

  return {
    name: 'playwright',
    clearErrors() { errors.length = 0; },
    getErrors() { return [...errors]; },
    getNotices() { return [...notices]; },
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
    getNotices() { return []; },
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

// OKLCH -> sRGB 0–255 (Björn Ottosson's OKLab matrices), for gradient stops read as strings.
function oklchToRgb(L, C, H) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
  return lin.map(c => {
    const v = Math.min(1, Math.max(0, c));
    return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
  });
}

function parseColorStops(bgImage) {
  const stops = [];
  if (!bgImage || !bgImage.includes('gradient')) return stops;
  for (const m of bgImage.matchAll(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+)(%?))?\s*\)/g)) {
    const a = m[5] === undefined ? 1 : parseFloat(m[5]) / (m[6] ? 100 : 1);
    if (a >= 0.4) stops.push(oklchToRgb(parseFloat(m[1]) / (m[2] ? 100 : 1), parseFloat(m[3]), parseFloat(m[4])));
  }
  for (const m of bgImage.matchAll(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/g)) {
    const a = m[4] === undefined ? 1 : parseFloat(m[4]);
    if (a >= 0.4) stops.push([+m[1], +m[2], +m[3]].map(v => Math.round(Math.min(1, Math.max(0, v)) * 255)));
  }
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
    // Normalise any computed CSS color (rgb, hex, oklch, color(srgb …), color-mix) to sRGB 0–255
    // by painting one pixel: the skill's palettes are OKLCH, so string parsing is not enough.
    const __cv = document.createElement('canvas');
    __cv.width = __cv.height = 1;
    const __cx = __cv.getContext('2d', { willReadFrequently: true });
    const toRgba = c => {
      if (!c) return null;
      __cx.clearRect(0, 0, 1, 1);
      __cx.fillStyle = 'rgba(0,0,0,0)';
      __cx.fillStyle = c;
      __cx.fillRect(0, 0, 1, 1);
      const d = __cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const rgbToOklch = (r, g, b) => {
      const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const lr = f(r), lg = f(g), lb = f(b);
      const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
      const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
      const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
      const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
      const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
      const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
      const C = Math.hypot(A, B);
      const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
      return [L, C, H];
    };
    const isPurpleRgb = rgba => {
      if (!rgba || rgba[3] < 0.5) return false;
      const [, C, H] = rgbToOklch(rgba[0], rgba[1], rgba[2]);
      return C >= 0.04 && H >= 280 && H <= 335;
    };

    // 0. OKLCH color hygiene: warn on pure #FFFFFF/#000000 slide bg or banned purple accent/tokens
    const slCs = getComputedStyle(sl);
    const bgRgba = toRgba(slCs.backgroundColor);
    if (bgRgba && bgRgba[3] >= 0.9 && (!slCs.backgroundImage || slCs.backgroundImage === 'none')) {
      const [bL, bC] = rgbToOklch(bgRgba[0], bgRgba[1], bgRgba[2]);
      if ((bL > 0.992 && bC < 0.004) || (bL < 0.12 && bC < 0.004)) {
        warnings.push(`投影片底色過於接近純白／純黑（OKLCH L=${bL.toFixed(3)}, C=${bC.toFixed(3)}），建議帶入微妙色溫`);
      }
    }
    const accentVal = slCs.getPropertyValue('--accent').trim();
    if (accentVal && isPurpleRgb(toRgba(accentVal))) {
      warnings.push(`偵測到禁用紫色主調 --accent (${accentVal}，OKLCH H 280–335, C >= 0.04)`);
    }

    // 0b. Deck-mode slide stacking contract (#stage > .slide must keep position: absolute)
    if (sl.parentElement && sl.parentElement.id === 'stage' && slCs.position !== 'absolute') {
      issues.push(`.slide 定位被覆寫為 position: ${slCs.position}（必須維持 absolute，否則多頁會垂直堆疊破版）`);
    }

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

    // 2. Broken images & video poster presence
    for (const img of sl.querySelectorAll('img')) {
      if (!img.complete || !img.naturalWidth) {
        issues.push(`圖片載入失敗：${(img.getAttribute('src') || '').slice(0, 40)}`);
      }
    }
    for (const vid of sl.querySelectorAll('video[data-slide-video]')) {
      if (!vid.getAttribute('poster')) {
        warnings.push('<video data-slide-video> 缺少 poster 靜態海報圖（列印或 ?still=1 時可能出現黑框）');
      }
    }

    // 3. Font errors (warning when offline)
    const badFonts = [...(document.fonts || [])].filter(f => f.status === 'error').map(f => f.family);
    if (badFonts.length) warnings.push(`字體載入失敗（使用系統退路）：${[...new Set(badFonts)].join(', ')}`);

    // 4. Container scroll overflow (fixed-height boxes only). .cover-inner and .closing-inner are
    // auto-height blocks anchored to the bottom: with a fallback font their giant line boxes report
    // scroll overflow that is never clipped, so they rely on the canvas bounds check instead.
    for (const el of sl.querySelectorAll('.shock-inner, .pillars, .st-body, [data-check-box]')) {
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

    // 5b. Deck-level meta.mode polarity check (ensures html[data-mode] actually activates matching --bg)
    const rootMode = (document.documentElement.dataset.mode || '').toLowerCase();
    const linC = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const lumRgba = c => c ? (0.2126 * linC(c[0]) + 0.7152 * linC(c[1]) + 0.0722 * linC(c[2])) : null;
    if ((rootMode === 'dark' || rootMode === 'light') && !sl.dataset.surface && kind !== 'shock') {
      const rootBgRaw = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      const rootBg = toRgba(rootBgRaw);
      const rootL = rootBg && rootBg[3] > 0.5 ? lumRgba(rootBg) : null;
      if (rootMode === 'dark' && rootL !== null && rootL > 0.25) {
        issues.push(`meta.mode="dark" 但根變數 --bg 過亮（L=${rootL.toFixed(2)}）：請確認 deck.css 或 shell.css 正確套用暗色底色`);
      } else if (rootMode === 'light' && rootL !== null && rootL < 0.45) {
        issues.push(`meta.mode="light" 但根變數 --bg 過暗（L=${rootL.toFixed(2)}）：請確認 deck.css 或 shell.css 正確套用亮色底色`);
      }
    }

    // 6. Collect visible text runs + bounds & min font size (active slide + visible #nav / #tabs chrome)
    const runs = [];
    const seenBounds = new Set();
    const seenSmall = new Set();
    const collectRunsIn = (root, isChrome) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode;
        const txt = t.textContent.trim();
        if (!txt) continue;
        const el = t.parentElement;
        if (!el || el.closest('style,script,title,defs,[aria-hidden="true"],[data-step-hidden="1"],.toc li.off,.snav')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) continue;

        const range = document.createRange();
        range.selectNodeContents(t);
        const rects = [...range.getClientRects()].filter(r => r.width > 1.5 && r.height > 1.5);
        if (!rects.length) continue;

        const fs = parseFloat(cs.fontSize) / scale;
        const fw = parseInt(cs.fontWeight, 10) || 400;
        const isFinePrint = isChrome || Boolean(el.closest('.source,.pageno,.foot,[data-role="source"],figcaption,small'));
        if (fs < (isFinePrint ? 16 : 18) && !seenSmall.has(txt.slice(0, 14))) {
          seenSmall.add(txt.slice(0, 14));
          issues.push(`文字太小（${fs.toFixed(0)}px）：「${txt.slice(0, 18)}」`);
        }
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
          const rgba = /^(none|url\()/.test(fillCol || '') ? null : toRgba(fillCol);
          const alpha = rgba ? rgba[3] : 1;
          const isGrad = !isSvg && clip.includes('text') && alpha < 0.2 && (cs.backgroundImage || '').includes('gradient');
          if (isGrad) {
            el.classList.add('__check_hide_grad');
            runs.push({
              text: txt.slice(0, 14), x: r.left, y: r.top, w: r.width, h: r.height,
              size: fs, weight: fw, gradient: cs.backgroundImage, rgb: null,
            });
          } else if (rgba && alpha >= 0.4) {
            runs.push({
              text: txt.slice(0, 14), x: r.left, y: r.top, w: r.width, h: r.height,
              size: fs, weight: fw, gradient: null, rgb: rgba.slice(0, 3),
            });
          }
        }
      }
    };
    collectRunsIn(sl, false);
    const stageEl = document.getElementById('stage');
    if (stageEl && !stageEl.classList.contains('hide-nav')) {
      for (const navId of ['nav', 'tabs']) {
        const navEl = document.getElementById(navId);
        if (!navEl) continue;
        const ncs = getComputedStyle(navEl);
        if (ncs.display !== 'none' && ncs.visibility !== 'hidden' && parseFloat(ncs.opacity) > 0.1) {
          collectRunsIn(navEl, true);
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
    '.slide, .slide *, #nav, #nav *, #tabs, #tabs * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }',
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
    const previewFile = path.join(dir, '.preview', f);
    const usePreview = fs.existsSync(previewFile);
    await driver.goto(pathToFileURL(usePreview ? previewFile : path.join(dir, f)).href + (usePreview ? '?still=1' : ''));
    if (usePreview) {
      await driver.addTempStyle('#hint, #toast, #ctrl-bar, #deck-progress { display: none !important; }', '__sheet_clean');
      await driver.wait(100);
    }
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

async function runMotionAudit(driver, filePath, outDir = null) {
  const results = [];
  const failures = [];
  const warnings = [];
  driver.clearErrors();
  await driver.setViewport(1920, 1080);
  await driver.goto(pathToFileURL(filePath).href);
  await driver.wait(280);

  const count = await driver.evaluate(() => window.__deck ? window.__deck.count : 0);
  if (!count) return { results: [], failures: ['找不到 window.__deck API'], warnings: [] };

  // 1. Rapid-fire zero-lockout interruption test + WAAPI fill:forwards cleanup verification
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
      const stepIdx = window.__deck.stepIndex || 0;
      const morphLeft = document.getElementById('morph-layer')?.children.length || 0;
      const hiddenMorph = [...document.querySelectorAll('[data-morph]')].filter(e => e.style.visibility === 'hidden').length;
      const actives = document.querySelectorAll('.slide.active').length;
      const leavings = document.querySelectorAll('.slide.leaving').length;
      const staleBgFocus = [...document.querySelectorAll('.slide:not(.active)')].filter(s => s.classList.contains('is-focusing') || s.querySelector('.focus-dim, .pre-transform')).length;
      return { idx, stepIdx, morphLeft, hiddenMorph, actives, leavings, staleBgFocus };
    });
    if ((rapid.idx + rapid.stepIdx) >= 3 && rapid.morphLeft === 0 && rapid.hiddenMorph === 0 && rapid.actives === 1 && rapid.leavings === 0 && rapid.staleBgFocus === 0) {
      results.push(`連按打斷測試（4 次／180ms）：通過（精準落於第 ${rapid.idx + 1} 頁${rapid.stepIdx ? ` 步進 ${rapid.stepIdx}` : ''}，無殘留 clone、壓暗與鎖死）`);
    } else {
      failures.push(`連按打斷異常：index=${rapid.idx}, stepIdx=${rapid.stepIdx}, morphLeft=${rapid.morphLeft}, hiddenMorph=${rapid.hiddenMorph}, actives=${rapid.actives}, leavings=${rapid.leavings}, staleBgFocus=${rapid.staleBgFocus}`);
    }
  }

  // 1b. WAAPI fill:forwards lock check (shock interruption during 220ms curtain pause; reverse iris/sheet-up return)
  const waapiTargets = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    let shock = -1, rev = -1, revKind = '';
    for (let i = 1; i < sls.length; i++) {
      if (sls[i].dataset.appendix === '1') continue;
      if (shock < 0 && sls[i].dataset.kind === 'shock') shock = i;
      const tr = (sls[i].dataset.transition || '').trim();
      if (rev < 0 && (tr === 'iris' || tr === 'sheet-up')) { rev = i; revKind = tr; }
    }
    return { shock, rev, revKind };
  });
  const waapiParts = [];
  if (waapiTargets.shock > 0) {
    await driver.evaluate(i => window.__deck.go(i - 1, true), waapiTargets.shock);
    await driver.wait(60);
    await driver.evaluate(i => window.__deck.go(i, false), waapiTargets.shock);
    await driver.wait(210); // Right inside the 220ms black-curtain hold after cIn finished
    await driver.evaluate(() => window.__deck.go(0, false));
    await driver.wait(520);
    const curtainState = await driver.evaluate(() => {
      const c = document.getElementById('curtain');
      if (!c) return { op: 0, anims: 0 };
      return { op: parseFloat(getComputedStyle(c).opacity) || 0, anims: c.getAnimations().length };
    });
    if (curtainState.op <= 0.02 && curtainState.anims === 0) {
      waapiParts.push(`shock 黑幕中斷（第 ${waapiTargets.shock + 1} 頁）`);
    } else {
      failures.push(`WAAPI 殘留鎖死：打斷 shock（第 ${waapiTargets.shock + 1} 頁）後 #curtain 停留在 opacity=${curtainState.op} / anims=${curtainState.anims}`);
    }
  }
  if (waapiTargets.rev > 0) {
    await driver.evaluate(i => window.__deck.go(i, true), waapiTargets.rev);
    await driver.wait(60);
    await driver.evaluate(i => window.__deck.go(i - 1, false), waapiTargets.rev);
    await driver.wait(820);
    await driver.evaluate(i => window.__deck.go(i, true), waapiTargets.rev);
    await driver.wait(80);
    const revState = await driver.evaluate(i => {
      const sl = window.__deck.slides[i];
      const cs = getComputedStyle(sl);
      return { anims: sl.getAnimations().length, clip: cs.clipPath, transform: cs.transform, op: parseFloat(cs.opacity) || 0 };
    }, waapiTargets.rev);
    if (revState.anims === 0 && (revState.clip === 'none' || !revState.clip) && (revState.transform === 'none' || !revState.transform) && revState.op >= 0.98) {
      waapiParts.push(`${waapiTargets.revKind} 回翻重進（第 ${waapiTargets.rev + 1} 頁）`);
    } else {
      failures.push(`WAAPI 殘留鎖死：${waapiTargets.revKind} 回翻再瞬切第 ${waapiTargets.rev + 1} 頁後殘留 ${JSON.stringify(revState)}`);
    }
  }
  if (waapiParts.length) {
    results.push(`WAAPI fill:forwards 防鎖死檢核（${waapiParts.join('、')}）：通過（零黑幕／零裁剪歸零／零殘留動畫）`);
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
    await driver.wait(1250);
    const post = await driver.evaluate(({ to, id }) => {
      const layer = document.getElementById('morph-layer')?.children.length || 0;
      const target = window.__deck.slides[to].querySelector(`[data-morph="${id}"]`);
      const vis = target ? getComputedStyle(target).visibility : 'missing';
      return { layer, vis };
    }, morphPair);
    // Test backward Magic Move too
    await driver.evaluate(i => window.__deck.go(i, false), morphPair.from);
    await driver.wait(1250);
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

  // 6. Phase B.3 Visual Guidance round-trip + beat duration / off-focus leak / SVG pop-vs-draw order checks
  const guidanceTargets = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    const out = [];
    const timingWarns = [];
    for (let i = 0; i < sls.length; i++) {
      const plan = sls[i].dataset.focusPlan || '';
      const hasTransform = Boolean(sls[i].querySelector('[data-transform-at]'));
      // Check SVG data-pop vs data-draw arrival order on every slide
      for (const svg of sls[i].querySelectorAll('svg')) {
        const draws = [...svg.querySelectorAll('[data-draw]')].filter(el => el.getAttribute('data-draw') !== 'ring');
        const pops = [...svg.querySelectorAll('[data-pop]')];
        if (draws.length === 1 && pops.length >= 1) {
          const dDel = parseFloat(draws[0].dataset.delay || '280') || 0;
          const dDur = parseFloat(draws[0].dataset.dur || '980') || 980;
          const dArr = dDel + dDur;
          for (const p of pops) {
            const pDel = parseFloat(p.dataset.delay || '320') || 0;
            if (pDel > dDel && pDel + 120 < dArr) {
              timingWarns.push(`第 ${i + 1} 頁 SVG [data-pop]（${pDel}ms）早於 [data-draw] 抵達（${dArr}ms），建議線到點再綻`);
              break;
            }
          }
        }
      }
      if (!plan && !hasTransform) continue;
      const beats = [];
      let minStart = Infinity;
      let maxEnd = 0;
      for (const m of plan.matchAll(/([^\s@,]+)@(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)/g)) {
        const st = parseFloat(m[2]), en = parseFloat(m[3]);
        beats.push({ id: m[1], start: st, end: en, dur: en - st });
        minStart = Math.min(minStart, st);
        maxEnd = Math.max(maxEnd, en);
      }
      for (const b of beats) {
        if (b.dur < 1100) {
          timingWarns.push(`第 ${i + 1} 頁 focus-plan 節拍 ${b.id} 僅 ${b.dur}ms（建議 1300–1800ms 保留靜止閱讀窗）`);
        }
      }
      if (beats.length > 1) {
        const firstId = beats[0].id;
        for (const fEl of sls[i].querySelectorAll('[data-focus]')) {
          const fIds = (fEl.dataset.focus || '').split(/[\s,]+/).filter(Boolean);
          if (!fIds.length || fIds.includes(firstId)) continue;
          const earlyKids = [...fEl.querySelectorAll('[data-count], [data-grow], [data-draw]')].filter(
            k => k.dataset.delay === undefined && k.dataset.beat === undefined && !k.closest('[data-step], [data-step-only]')
          );
          if (earlyKids.length) {
            timingWarns.push(`第 ${i + 1} 頁 data-focus="${fEl.dataset.focus}" 內有 ${earlyKids.length} 個子原語未設 data-delay，恐於壓暗階段偷跑`);
          }
        }
      }
      if (!Number.isFinite(minStart)) minStart = 0;
      for (const el of sls[i].querySelectorAll('[data-transform-at]')) {
        maxEnd = Math.max(maxEnd, (parseFloat(el.dataset.transformAt) || 1400) + 950);
      }
      out.push({ idx: i, hasPlan: Boolean(plan), hasTransform, minStart, maxEnd });
    }
    return { out, timingWarns };
  });
  warnings.push(...guidanceTargets.timingWarns);
  if (guidanceTargets.out.length) {
    const checkedSlides = [];
    for (const gt of guidanceTargets.out) {
      const fromIdx = gt.idx === 0 ? Math.min(1, count - 1) : gt.idx - 1;
      await driver.evaluate(i => window.__deck.go(i, true), fromIdx);
      await driver.wait(60);
      await driver.evaluate(i => window.__deck.go(i, false), gt.idx);
      const midWait = Math.min(gt.minStart + 320, Math.max(240, gt.maxEnd - 100));
      await driver.wait(midWait);
      const mid = await driver.evaluate(i => {
        const sl = window.__deck.slides[i];
        return {
          focusing: sl.classList.contains('is-focusing'),
          active: sl.querySelectorAll('.focus-active').length,
          dim: sl.querySelectorAll('.focus-dim').length,
          pre: sl.querySelectorAll('.pre-transform').length,
        };
      }, gt.idx);
      await driver.wait(Math.max(400, gt.maxEnd - midWait + 560));
      const end = await driver.evaluate(i => {
        const sl = window.__deck.slides[i];
        return {
          focusing: sl.classList.contains('is-focusing'),
          active: sl.querySelectorAll('.focus-active').length,
          dim: sl.querySelectorAll('.focus-dim').length,
          pre: sl.querySelectorAll('.pre-transform').length,
        };
      }, gt.idx);
      const midOk = (!gt.hasPlan || (mid.focusing && mid.active > 0)) && (!gt.hasTransform || mid.pre > 0);
      const endOk = !end.focusing && end.active === 0 && end.dim === 0 && end.pre === 0;
      if (midOk && endOk) {
        checkedSlides.push(`第 ${gt.idx + 1} 頁`);
      } else {
        failures.push(`第 ${gt.idx + 1} 頁視覺指引復原異常：mid=${JSON.stringify(mid)}, end=${JSON.stringify(end)}`);
      }
    }
    if (checkedSlides.length === guidanceTargets.out.length) {
      results.push(`視覺指引聚光壓暗／因果演變（${checkedSlides.join('、')}）：通過（演繹期間明確聚焦，結束 100% 復原零殘留）`);
    }
  }

  // 7. Phase B.3 SVG connector integrity (no zero-bbox SVG <line data-grow> or <g data-draw> anti-pattern; all [data-draw] valid)
  const connAudit = await driver.evaluate(() => {
    const bad = [];
    let drawCount = 0;
    let wipeCount = 0;
    for (let i = 0; i < window.__deck.slides.length; i++) {
      const sl = window.__deck.slides[i];
      for (const el of sl.querySelectorAll('svg line[data-grow]')) {
        bad.push(`第 ${i + 1} 頁對 SVG <line> 誤用 data-grow（應改用 <path data-draw> 或 HTML data-wipe）`);
      }
      for (const el of sl.querySelectorAll('[data-draw]')) {
        drawCount++;
        if (el.getAttribute('data-draw') !== 'ring') {
          if (typeof el.getTotalLength !== 'function') {
            bad.push(`第 ${i + 1} 頁對非幾何路徑元素 <${el.tagName.toLowerCase()}> 誤用 data-draw（無 getTotalLength，請改掛在 <path>／<line>／<polyline>／<circle> 上）`);
          } else if (el.getTotalLength() <= 0) {
            bad.push(`第 ${i + 1} 頁 [data-draw] 路徑長度為 0`);
          }
        }
      }
      wipeCount += sl.querySelectorAll('[data-wipe]').length;
    }
    return { bad, drawCount, wipeCount };
  });
  if (connAudit.bad.length) {
    failures.push(...connAudit.bad);
  } else {
    results.push(`引導線與描繪原語檢核（${connAudit.drawCount} 條 SVG 描線／${connAudit.wipeCount} 處方向揭露）：通過（零退化 SVG 縮放／零無效容器描線）`);
  }

  // 8. v4.4 Per-slide polarity (data-surface="dark|light|split|photo") & stage chrome sync
  const surfaceTargets = await driver.evaluate(() => {
    const out = [];
    const seen = new Set();
    window.__deck.slides.forEach((sl, i) => {
      const s = sl.dataset.surface;
      if (s && !seen.has(s)) { seen.add(s); out.push({ idx: i, surface: s }); }
    });
    return out;
  });
  if (surfaceTargets.length) {
    const surfLums = {};
    let surfOk = true;
    const surfErrs = [];
    for (const st of surfaceTargets) {
      await driver.evaluate(i => window.__deck.go(i, true), st.idx);
      await driver.wait(80);
      const info = await driver.evaluate(i => {
        const sl = window.__deck.slides[i];
        const bg = getComputedStyle(sl).backgroundColor;
        // Paint one pixel so oklch()/color() backgrounds are measured correctly, not string-parsed.
        const cv = document.createElement('canvas');
        cv.width = cv.height = 1;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        cx.fillStyle = '#000';
        cx.fillStyle = bg || '#000';
        cx.fillRect(0, 0, 1, 1);
        const rgb = [...cx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        const l = 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
        return { activeSurface: window.__deck.activeSurface, l, bg };
      }, st.idx);
      surfLums[st.surface] = info.l;
      if (info.activeSurface !== st.surface) {
        surfOk = false;
        surfErrs.push(`第 ${st.idx + 1} 頁 activeSurface=${info.activeSurface}（預期 ${st.surface}）`);
      }
    }
    if (surfLums.light !== undefined && surfLums.dark !== undefined) {
      if (surfLums.light < 0.50 || surfLums.dark > 0.18) {
        surfOk = false;
        surfErrs.push(`光暗雙極亮度未拉開（light=${surfLums.light.toFixed(2)}, dark=${surfLums.dark.toFixed(2)}）`);
      }
    }
    if (surfOk) {
      results.push(`單頁明暗極性 data-surface（${surfaceTargets.map(x => x.surface).join('／')}）：通過（變數與舞台外殼極性同步切換）`);
    } else {
      failures.push(`單頁極性異常：${surfErrs.join('；')}`);
    }
  }

  // 9. v4.4 nav_mode (top-bar / minimal-side / divider-only) & auto-hiding #ctrl-bar
  const navBarCheck = await driver.evaluate(() => {
    const bar = document.getElementById('ctrl-bar');
    const prog = document.getElementById('deck-progress');
    if (!bar || !prog) return { ok: false, reason: '找不到 #ctrl-bar 或 #deck-progress' };
    const startHidden = !bar.classList.contains('visible');
    const shown = window.__deck.setCtrlBarVisible(true, true);
    const posTxt = (bar.querySelector('.cb-pos')?.textContent || '').trim();
    window.__deck.setCtrlBarVisible(false);
    const endHidden = !bar.classList.contains('visible');

    // Verify per-slide nav_mode classes on content slides
    const navMode = window.__deck.navMode || 'top-bar';
    const checkedModes = new Set();
    let modeErr = '';
    for (let i = 0; i < window.__deck.slides.length; i++) {
      const sl = window.__deck.slides[i];
      if (sl.dataset.kind !== 'content' || sl.dataset.appendix === '1' || Number(sl.dataset.chi ?? -1) < 0) continue;
      const eff = sl.dataset.nav || (sl.querySelector('nav.slide-nav, nav[data-auto-nav], [data-auto-nav]') ? 'inline' : navMode);
      if (checkedModes.has(eff)) continue;
      checkedModes.add(eff);
      window.__deck.go(i, true);
      const hideTop = window.__deck.stage.classList.contains('hide-nav');
      const showSide = window.__deck.stage.classList.contains('show-side-nav');
      if (eff === 'divider-only' && (!hideTop || showSide)) modeErr = `divider-only 未隱藏頂/側導航 (第 ${i + 1} 頁)`;
      if (eff === 'minimal-side' && (!hideTop || !showSide)) modeErr = `minimal-side 未顯示側邊錨點 (第 ${i + 1} 頁)`;
      if (eff === 'top-bar' && (hideTop || showSide)) modeErr = `top-bar 未顯示頂部章節列 (第 ${i + 1} 頁)`;
    }
    return {
      ok: startHidden && shown && Boolean(posTxt) && endHidden && !modeErr,
      navMode,
      checkedModes: [...checkedModes],
      posTxt,
      reason: modeErr || `startHidden=${startHidden}, shown=${shown}, endHidden=${endHidden}`,
    };
  });
  if (navBarCheck.ok) {
    results.push(`導航模式（${navBarCheck.navMode}${navBarCheck.checkedModes.length ? '｜實測 ' + navBarCheck.checkedModes.join('／') : ''}）與自動隱藏底控膠囊：通過（頁碼 ${navBarCheck.posTxt}、浮現與自動收合正常）`);
  } else {
    failures.push(`導航與底控列異常：${navBarCheck.reason}`);
  }

  // 10. v5.0 Full-deck data-step audit (all step slides, nested step isolation, backward landing, static expand + filmstrip-sXX.jpg)
  const stepTargets = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    const out = [];
    for (let i = 0; i < sls.length; i++) {
      if (sls[i].querySelector('[data-step], [data-step-only], [data-step-hide]')) {
        const isApp = sls[i].dataset.appendix === '1';
        const nextMain = isApp ? -1 : sls.findIndex((s, j) => j > i && s.dataset.appendix !== '1');
        out.push({ idx: i, isApp, nextMain });
      }
    }
    return out;
  });
  if (stepTargets.length) {
    await driver.addTempStyle('#hint, #toast, #ctrl-bar { display: none !important; }', '__check_filmstrip_clean');
    const passedStepSlides = [];
    const filmstripsWritten = [];
    let crossBoundaryChecked = false;
    for (const st of stepTargets) {
      await driver.evaluate(i => window.__deck.go(i, true, { step: 0 }), st.idx);
      await driver.wait(120);
      const s0 = await driver.evaluate(i => {
        const sl = window.__deck.slides[i];
        const step1 = sl.querySelector('[data-step="1"], [data-step-only="1"]');
        const leakedAt0 = [...sl.querySelectorAll('[data-step], [data-step-only]')].filter(el => {
          const req = Math.max(parseInt(el.dataset.step || '0', 10) || 0, parseInt(el.dataset.stepOnly || '0', 10) || 0);
          return req > 0 && el.dataset.stepHidden !== '1';
        }).length;
        return {
          idx: window.__deck.index,
          stepIndex: window.__deck.stepIndex,
          stepTotal: window.__deck.stepTotal,
          step1Hidden: step1 ? step1.dataset.stepHidden === '1' : true,
          leakedAt0,
        };
      }, st.idx);

      const frames = [];
      if (outDir && s0.stepTotal > 0) {
        const b0 = await driver.screenshot({ type: 'jpeg', quality: 86 });
        frames.push({ label: `S${String(st.idx + 1).padStart(2, '0')} · Step 0/${s0.stepTotal}`, b64: b0.toString('base64') });
      }

      const midStep = Math.max(1, Math.ceil(s0.stepTotal / 2));
      let nestedLeakCount = s0.leakedAt0;
      for (let k = 1; k <= s0.stepTotal; k++) {
        await driver.evaluate(() => window.__deck.step(1));
        if (outDir && s0.stepTotal === 1 && k === 1) {
          await driver.wait(380);
          const bMid = await driver.screenshot({ type: 'jpeg', quality: 86 });
          frames.push({ label: `S${String(st.idx + 1).padStart(2, '0')} · Mid (Reveal)`, b64: bMid.toString('base64') });
          await driver.wait(640);
          const bEnd = await driver.screenshot({ type: 'jpeg', quality: 86 });
          frames.push({ label: `S${String(st.idx + 1).padStart(2, '0')} · End (Step 1/1)`, b64: bEnd.toString('base64') });
        } else if (outDir && k === midStep && midStep < s0.stepTotal) {
          await driver.wait(920);
          const bMid = await driver.screenshot({ type: 'jpeg', quality: 86 });
          frames.push({ label: `S${String(st.idx + 1).padStart(2, '0')} · Mid (Step ${k}/${s0.stepTotal})`, b64: bMid.toString('base64') });
        } else if (outDir && k === s0.stepTotal) {
          await driver.wait(950);
          const bEnd = await driver.screenshot({ type: 'jpeg', quality: 86 });
          frames.push({ label: `S${String(st.idx + 1).padStart(2, '0')} · End (Step ${k}/${s0.stepTotal})`, b64: bEnd.toString('base64') });
        } else {
          await driver.wait(260);
        }
        const leakK = await driver.evaluate(({ i, curK }) => {
          const sl = window.__deck.slides[i];
          return [...sl.querySelectorAll('[data-step], [data-step-only]')].filter(el => {
            const sAttr = parseInt(el.dataset.step || '0', 10) || 0;
            const oAttr = el.dataset.stepOnly !== undefined ? parseInt(el.dataset.stepOnly, 10) : -1;
            if (sAttr > curK && el.dataset.stepHidden !== '1') return true;
            if (oAttr >= 0 && oAttr !== curK && el.dataset.stepHidden !== '1') return true;
            return false;
          }).length;
        }, { i: st.idx, curK: k });
        nestedLeakCount += leakK;
      }

      const sEnd = await driver.evaluate(i => {
        const sl = window.__deck.slides[i];
        const step1 = sl.querySelector('[data-step="1"]');
        const only0 = sl.querySelector('[data-step-only="0"]');
        return {
          idx: window.__deck.index,
          stepIndex: window.__deck.stepIndex,
          step1Shown: step1 ? step1.dataset.stepHidden === '0' : true,
          only0Hidden: only0 ? only0.dataset.stepHidden === '1' : true,
        };
      }, st.idx);

      let backLandingOk = true;
      let stepBackOk = true;
      if (!st.isApp && st.nextMain >= 0 && !crossBoundaryChecked) {
        crossBoundaryChecked = true;
        await driver.evaluate(() => window.__deck.step(1));
        await driver.wait(420);
        const afterAdvance = await driver.evaluate(() => window.__deck.index);
        await driver.evaluate(() => window.__deck.step(-1));
        await driver.wait(420);
        const afterBack = await driver.evaluate(() => ({ idx: window.__deck.index, stepIndex: window.__deck.stepIndex, stepTotal: window.__deck.stepTotal }));
        backLandingOk = afterAdvance === st.nextMain && afterBack.idx === st.idx && afterBack.stepIndex === afterBack.stepTotal;
        await driver.evaluate(() => window.__deck.step(-1));
        await driver.wait(260);
        const afterStepBack = await driver.evaluate(() => window.__deck.stepIndex);
        stepBackOk = afterStepBack === Math.max(0, s0.stepTotal - 1);
      }

      const stillExpandOk = await driver.evaluate(i => {
        window.__deck.go(i, true, { step: 0 });
        window.__deck.setStill(true);
        const expanded = window.__deck.stepIndex === window.__deck.stepTotal;
        window.__deck.setStill(false);
        return expanded;
      }, st.idx);

      if (outDir && frames.length === 3) {
        const stripDataUrl = await driver.evaluate(async items => {
          const fw = 640, fh = 360, pad = 8, bar = 28;
          const cv = document.createElement('canvas');
          cv.width = fw * 3 + pad * 4;
          cv.height = fh + bar + pad * 2;
          const cx = cv.getContext('2d');
          cx.fillStyle = '#141518';
          cx.fillRect(0, 0, cv.width, cv.height);
          cx.font = '600 14px system-ui, -apple-system, sans-serif';
          cx.textBaseline = 'middle';
          for (let j = 0; j < items.length; j++) {
            const x = pad + j * (fw + pad);
            cx.fillStyle = '#d4d7dd';
            cx.fillText(items[j].label, x + 6, pad + bar / 2);
            const img = new Image();
            await new Promise((res, rej) => {
              img.onload = res;
              img.onerror = rej;
              img.src = 'data:image/jpeg;base64,' + items[j].b64;
            });
            cx.drawImage(img, x, pad + bar, fw, fh);
            cx.strokeStyle = 'rgba(255,255,255,0.16)';
            cx.lineWidth = 1;
            cx.strokeRect(x + 0.5, pad + bar + 0.5, fw - 1, fh - 1);
          }
          return cv.toDataURL('image/jpeg', 0.86);
        }, frames).catch(() => null);
        if (stripDataUrl && stripDataUrl.includes(',')) {
          const fname = `filmstrip-s${String(st.idx + 1).padStart(2, '0')}.jpg`;
          fs.writeFileSync(path.join(outDir, fname), Buffer.from(stripDataUrl.split(',')[1], 'base64'));
          filmstripsWritten.push(fname);
        }
      }

      if (s0.stepTotal > 0 && s0.stepIndex === 0 && s0.step1Hidden && nestedLeakCount === 0 && sEnd.idx === st.idx && sEnd.stepIndex === s0.stepTotal && sEnd.step1Shown && sEnd.only0Hidden && backLandingOk && stepBackOk && stillExpandOk) {
        passedStepSlides.push(`第 ${st.idx + 1} 頁（${s0.stepTotal} 步）`);
      } else {
        failures.push(`第 ${st.idx + 1} 頁 data-step 步進異常：s0=${JSON.stringify(s0)}, sEnd=${JSON.stringify(sEnd)}, nestedLeaks=${nestedLeakCount}, backLanding=${backLandingOk}, stepBack=${stepBackOk}, stillExpand=${stillExpandOk}`);
      }
    }
    await driver.removeTempStyle('__check_filmstrip_clean');
    if (passedStepSlides.length === stepTargets.length) {
      const stripNote = filmstripsWritten.length ? `；已輸出分鏡條 ${filmstripsWritten.join('、')}` : '';
      results.push(`講者點擊步進 data-step 全場檢核（${passedStepSlides.join('、')}）：通過（逐層／巢狀隔離／回翻落終態／靜態全展開${stripNote}）`);
    }
  }

  // 11. v4.4 External media (<video>/<audio>) pause & reset on leave + HTML5 native carousels (flow-carousel / coverflow)
  const mediaWidgetTargets = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    const videos = [], audios = [], flows = [], covers = [];
    const base64Media = [];
    sls.forEach((sl, i) => {
      sl.querySelectorAll('video[data-slide-video]').forEach(v => {
        const src = v.getAttribute('src') || v.querySelector('source')?.getAttribute('src') || '';
        if (src.startsWith('data:')) base64Media.push(`第 ${i + 1} 頁 <video> 不應內嵌 Base64`);
        videos.push(i);
      });
      sl.querySelectorAll('audio[data-sound-demo]').forEach(a => {
        const src = a.getAttribute('src') || a.querySelector('source')?.getAttribute('src') || '';
        if (src.startsWith('data:')) base64Media.push(`第 ${i + 1} 頁 <audio> 不應內嵌 Base64`);
        audios.push(i);
      });
      if (sl.querySelector('[data-flow-carousel]')) flows.push(i);
      if (sl.querySelector('[data-coverflow]')) covers.push(i);
    });
    return { videos: [...new Set(videos)], audios: [...new Set(audios)], flows, covers, base64Media };
  });
  if (mediaWidgetTargets.base64Media.length) {
    failures.push(...mediaWidgetTargets.base64Media);
  }
  const mwParts = [];
  if (mediaWidgetTargets.videos.length) {
    const vi = mediaWidgetTargets.videos[0];
    const other = vi === 0 ? Math.min(1, count - 1) : 0;
    await driver.evaluate(i => window.__deck.go(i, true), vi);
    await driver.wait(220);
    await driver.evaluate(i => {
      const v = window.__deck.slides[i].querySelector('video[data-slide-video]');
      if (v) { try { v.currentTime = 0.25; } catch (_) {} }
    }, vi);
    await driver.evaluate(i => window.__deck.go(i, true), other);
    await driver.wait(160);
    const vRes = await driver.evaluate(i => {
      const v = window.__deck.slides[i].querySelector('video[data-slide-video]');
      return { paused: v ? v.paused : false, time: v ? v.currentTime : -1 };
    }, vi);
    if (vRes.paused && vRes.time === 0) mwParts.push(`外連影片（第 ${vi + 1} 頁）離頁停播歸零`);
    else failures.push(`第 ${vi + 1} 頁影片離頁未停播歸零：${JSON.stringify(vRes)}`);
  }
  if (mediaWidgetTargets.audios.length) {
    const ai = mediaWidgetTargets.audios[0];
    const other = ai === 0 ? Math.min(1, count - 1) : 0;
    await driver.evaluate(i => window.__deck.go(i, true), ai);
    await driver.wait(180);
    const aClickOk = await driver.evaluate(i => {
      const sl = window.__deck.slides[i];
      const btn = sl.querySelector('.sound-play-btn');
      const a = sl.querySelector('audio[data-sound-demo]');
      if (!btn || !a) return false;
      btn.click();
      try { a.currentTime = 0.2; } catch (_) {}
      return window.__deck.index === i;
    }, ai);
    await driver.evaluate(i => window.__deck.go(i, true), other);
    await driver.wait(160);
    const aRes = await driver.evaluate(i => {
      const a = window.__deck.slides[i].querySelector('audio[data-sound-demo]');
      const bar = a?._soundBar;
      return { paused: a ? a.paused : false, time: a ? a.currentTime : -1, playingCls: bar ? bar.classList.contains('is-playing') : false };
    }, ai);
    if (aClickOk && aRes.paused && aRes.time === 0 && !aRes.playingCls) mwParts.push(`實測音檔（第 ${ai + 1} 頁）不誤翻頁且離頁歸零`);
    else failures.push(`第 ${ai + 1} 頁音檔控制異常：clickOk=${aClickOk}, res=${JSON.stringify(aRes)}`);
  }
  if (mediaWidgetTargets.flows.length) {
    const fi = mediaWidgetTargets.flows[0];
    await driver.evaluate(i => window.__deck.go(i, true), fi);
    await driver.wait(140);
    const fRes = await driver.evaluate(i => {
      const root = window.__deck.slides[i].querySelector('[data-flow-carousel]');
      const mode = (root.getAttribute('data-flow-carousel') || 'vertical').trim().toLowerCase();
      const tabs = [...root.querySelectorAll('[data-fc-idx]')];
      if (tabs.length >= 2) {
        const before = root.dataset.activeIndex;
        tabs[1].click();
        const after = root.dataset.activeIndex;
        const stayed = window.__deck.index === i;
        tabs[0].click();
        return { mode, ok: stayed && before !== after };
      }
      const nextScrub = root.querySelector('[data-fc-act="next"]');
      if (nextScrub) {
        const before = root.dataset.activeIndex;
        nextScrub.click();
        const after = root.dataset.activeIndex;
        const stayed = window.__deck.index === i;
        return { mode, ok: stayed && before !== after };
      }
      if (mode === 'chat' && root._flowCarousel) {
        root._flowCarousel.apply(0);
        const c0 = root.querySelectorAll('.is-shown').length;
        root._flowCarousel.apply(1);
        const c1 = root.querySelectorAll('.is-shown').length;
        return { mode, ok: c0 === 1 && c1 === 2 && window.__deck.index === i };
      }
      return { mode, ok: Boolean(root._flowCarousel) };
    }, fi);
    if (fRes.ok) mwParts.push(`活流程輪播（第 ${fi + 1} 頁 ${fRes.mode}）切換不誤翻頁`);
    else failures.push(`第 ${fi + 1} 頁活流程輪播異常：${JSON.stringify(fRes)}`);
  }
  if (mediaWidgetTargets.covers.length) {
    const ci = mediaWidgetTargets.covers[0];
    await driver.evaluate(i => window.__deck.go(i, true), ci);
    await driver.wait(140);
    const cRes = await driver.evaluate(i => {
      const root = window.__deck.slides[i].querySelector('[data-coverflow]');
      const nextBtn = root.querySelector('.cf-next');
      const before = root.dataset.activeIndex;
      nextBtn.click();
      const after = root.dataset.activeIndex;
      const stayed = window.__deck.index === i;
      return { before, after, stayed };
    }, ci);
    if (cRes.stayed && cRes.before !== cRes.after) mwParts.push(`3D 照片輪播（第 ${ci + 1} 頁）切換不誤翻頁`);
    else failures.push(`第 ${ci + 1} 頁 3D 照片輪播異常：${JSON.stringify(cRes)}`);
  }
  if (mwParts.length) {
    results.push(`多媒體與原生輪播原語（${mwParts.join('、')}）：通過`);
  }

  // 12. v4.5 Layer 1 Presenter Chrome (grid-overview G + scoped thumbnail fidelity, annotator A / laser L, speaker-view S)
  const presenterParts = [];
  const pCheck = await driver.evaluate(() => {
    const out = { grid: null, gridStyleOk: true, annotator: null, speaker: null };
    if (window.__deckGrid) {
      window.__deckGrid.open();
      const opened = window.__deckGrid.isOpen() && window.__deck.hasNavLock();
      // Verify free-canvas thumbnails preserve [data-slide-scope] styling instead of collapsing to bare HTML
      const freeIdx = window.__deck.slides.findIndex(s => s.hasAttribute('data-slide-scope') && s.querySelector('h1, h2'));
      if (freeIdx >= 0) {
        const origH = window.__deck.slides[freeIdx].querySelector('h1, h2');
        const thumbSlide = document.querySelector(`#deck-grid .dg-card[data-slide-idx="${freeIdx}"] .dg-thumb-stage .slide`);
        const thumbH = thumbSlide ? thumbSlide.querySelector('h1, h2') : null;
        if (!thumbSlide || !thumbSlide.hasAttribute('data-slide-scope') || !thumbH) {
          out.gridStyleOk = false;
        } else {
          const origFs = parseFloat(getComputedStyle(origH).fontSize) || 0;
          const thumbFs = parseFloat(getComputedStyle(thumbH).fontSize) || 0;
          if (origFs > 32 && Math.abs(origFs - thumbFs) > 3) out.gridStyleOk = false;
        }
      }
      const closedByEsc = window.__deck.closeTopOverlay() && !window.__deckGrid.isOpen() && !window.__deck.hasNavLock();
      out.grid = opened && closedByEsc && out.gridStyleOk;
    }
    if (window.__deckAnnotator) {
      window.__deckAnnotator.setDrawing(true);
      const drawLock = window.__deckAnnotator.isDrawing && window.__deck.hasNavLock();
      const escExit = window.__deck.closeTopOverlay() && !window.__deckAnnotator.isDrawing && !window.__deck.hasNavLock();
      window.__deckAnnotator.setLaser(true);
      const laserFree = window.__deckAnnotator.isLaser && !window.__deck.hasNavLock();
      window.__deckAnnotator.setLaser(false);
      out.annotator = drawLock && escExit && laserFree;
    }
    if (window.__deckSpeaker) {
      const p = window.__deckSpeaker.getPayload();
      const mainTotal = window.__deck.slides.filter(s => s.dataset.appendix !== '1').length;
      out.speaker = Boolean(p && p.type === 'state' && p.current && (p.total === mainTotal || p.total === window.__deck.count) && window.__deckSpeaker.channelName);
    }
    return out;
  });
  if (pCheck.grid !== null) {
    if (pCheck.grid) presenterParts.push('總覽矩陣 G（含縮圖樣式保真）');
    else failures.push(`Layer 1 總覽矩陣（G）開啟／鎖定／縮圖作用域異常（gridStyleOk=${pCheck.gridStyleOk}）`);
  }
  if (pCheck.annotator !== null) {
    if (pCheck.annotator) presenterParts.push('畫筆標註 A 與雷射筆 L');
    else failures.push('Layer 1 畫筆標註（A）／雷射筆（L）鎖定或退出異常');
  }
  if (pCheck.speaker !== null) {
    if (pCheck.speaker) presenterParts.push('雙螢幕講者同步 S');
    else failures.push('Layer 1 講者模式（S）狀態同步 payload 異常');
  }
  if (presenterParts.length) {
    results.push(`Layer 1 講者臨場工具（${presenterParts.join('、')}）：通過（快捷鍵鎖定與 Esc 層級退出正常）`);
  }

  // 13. v4.5 Layer 2 Content Persuasion Modules (linked-highlight, compare-slider, code-stage, visual-flair, sound-ab)
  const v45Parts = [];
  const v45Targets = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    const find = sel => sls.findIndex(sl => Boolean(sl.querySelector(sel)));
    return {
      ref: find('[data-ref]'),
      compare: find('[data-compare-slider]'),
      code: find('[data-code-stage]'),
      zoom: find('[data-zoomable]'),
      soundAb: find('[data-sound-ab]'),
    };
  });
  if (v45Targets.ref >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), v45Targets.ref);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const sl = window.__deck.slides[i];
      const first = sl.querySelector('[data-ref]');
      first.click();
      const hit = sl.classList.contains('is-ref-linking') && first.classList.contains('is-ref-hit') && window.__deck.index === i;
      first.click();
      const cleared = !sl.classList.contains('is-ref-linking');
      return hit && cleared;
    }, v45Targets.ref);
    if (ok) v45Parts.push(`文圖聯動（第 ${v45Targets.ref + 1} 頁）`);
    else failures.push(`第 ${v45Targets.ref + 1} 頁文圖聯動 [data-ref] 異常`);
  }
  if (v45Targets.compare >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), v45Targets.compare);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const el = window.__deck.slides[i].querySelector('[data-compare-slider]');
      if (!el || !el._compareSlider) return false;
      el._compareSlider.setPos(74);
      const moved = el.dataset.pos === '74';
      el._compareSlider.reset();
      return moved;
    }, v45Targets.compare);
    if (ok) v45Parts.push(`前後對比拉桿（第 ${v45Targets.compare + 1} 頁）`);
    else failures.push(`第 ${v45Targets.compare + 1} 頁前後對比拉桿 [data-compare-slider] 異常`);
  }
  if (v45Targets.code >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true, { step: 0 }), v45Targets.code);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const el = window.__deck.slides[i].querySelector('[data-code-stage]');
      const lines = el ? el.querySelectorAll('.cs-line').length : 0;
      const toks = el ? el.querySelectorAll('.tok-kw, .tok-fn, .tok-str').length : 0;
      return lines > 0 && toks > 0;
    }, v45Targets.code);
    if (ok) v45Parts.push(`程式碼聚焦舞台（第 ${v45Targets.code + 1} 頁）`);
    else failures.push(`第 ${v45Targets.code + 1} 頁程式碼舞台 [data-code-stage] 渲染異常`);
  }
  if (v45Targets.zoom >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), v45Targets.zoom);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const el = window.__deck.slides[i].querySelector('[data-zoomable]');
      el.click();
      const lb = document.getElementById('deck-lightbox');
      const opened = Boolean(lb && lb.classList.contains('open') && window.__deck.hasNavLock());
      const closed = window.__deck.closeTopOverlay() && lb && !lb.classList.contains('open');
      return opened && closed;
    }, v45Targets.zoom);
    if (ok) v45Parts.push(`圖表燈箱放大（第 ${v45Targets.zoom + 1} 頁）`);
    else failures.push(`第 ${v45Targets.zoom + 1} 頁 [data-zoomable] 燈箱異常`);
  }
  if (v45Targets.soundAb >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), v45Targets.soundAb);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const el = window.__deck.slides[i].querySelector('[data-sound-ab]');
      const btns = el ? [...el.querySelectorAll('.sound-ab-btn')] : [];
      if (btns.length < 2) return false;
      btns[1].click();
      const switched = el.dataset.activeTrack === '1' && window.__deck.index === i;
      btns[0].click();
      return switched && el.dataset.activeTrack === '0';
    }, v45Targets.soundAb);
    if (ok) v45Parts.push(`音訊 A/B 同步切換（第 ${v45Targets.soundAb + 1} 頁）`);
    else failures.push(`第 ${v45Targets.soundAb + 1} 頁 [data-sound-ab] 異常`);
  }
  if (v45Parts.length) {
    results.push(`v4.5 說服力互動模組（${v45Parts.join('、')}）：通過`);
  }

  // 14. Reading-window stillness check (Takeaway #2: no infinite pulsing/bouncing distractions on content slides)
  const infHits = await driver.evaluate(() => {
    const bad = [];
    window.__deck.slides.forEach((sl, idx) => {
      if (sl.dataset.appendix === '1') return;
      const els = sl.querySelectorAll('*');
      for (const el of els) {
        if (el.closest('[data-marquee], .cr-typing.is-on, .tw-cursor, .fx-canvas, .ap-live-dot')) continue;
        const st = getComputedStyle(el);
        if (st.animationName && st.animationName !== 'none' && st.animationIterationCount === 'infinite') {
          bad.push(`第 ${idx + 1} 頁 <${el.tagName.toLowerCase()}> (${st.animationName})`);
          break;
        }
      }
    });
    return bad;
  });
  if (infHits.length) {
    failures.push(`閱讀期靜止檢核未過（偵測到永動干擾動畫，違背「畫完就安靜」原則）：${infHits.join('、')}`);
  } else {
    results.push('閱讀期靜止檢核（反永動干擾／畫完就安靜）：通過');
  }

  // 15. Mobile 390px viewport sanity check (stage fit + #ctrl-bar horizontal fit without clipping)
  await driver.setViewport(390, 844);
  await driver.wait(160);
  const mobileRes = await driver.evaluate(() => {
    const overflow = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
    const st = document.getElementById('stage');
    const r = st ? st.getBoundingClientRect() : null;
    const okBox = Boolean(r && r.width > 200 && r.width <= window.innerWidth + 2 && r.height > 100);
    let ctrlOk = true, ctrlW = 0;
    const cb = document.getElementById('ctrl-bar');
    if (cb && typeof window.__deck.setCtrlBarVisible === 'function') {
      window.__deck.setCtrlBarVisible(true, true);
      const cr = cb.getBoundingClientRect();
      ctrlW = Math.round(cr.width);
      ctrlOk = cr.left >= -1 && cr.right <= window.innerWidth + 1;
      window.__deck.setCtrlBarVisible(false, false);
    }
    return { overflow, okBox, w: r ? Math.round(r.width) : 0, ctrlOk, ctrlW };
  });
  await driver.setViewport(1920, 1080);
  await driver.wait(120);
  if (mobileRes.overflow <= 1 && mobileRes.okBox && mobileRes.ctrlOk) {
    results.push(`390px 手機縮放與控制條實測（橫向溢出 0px、舞台 ${mobileRes.w}px、控制條 ${mobileRes.ctrlW}px 零裁切）：通過`);
  } else {
    failures.push(`390px 手機實測異常（橫向溢出 ${mobileRes.overflow}px、舞台實寬 ${mobileRes.w}px、控制條寬 ${mobileRes.ctrlW}px ctrlOk=${mobileRes.ctrlOk}）`);
  }

  // 16. v4.7 Style Motion Kits functional & low-power/still contract verification
  const kitTargets = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    const find = sel => sls.findIndex(sl => Boolean(sl.querySelector(sel)));
    return {
      ruler: find('[data-ruler-progress]'),
      bento: find('[data-bento-expand]'),
      rank: find('[data-rank-race]'),
      odo: find('[data-odometer]'),
      rack: find('[data-rack-focus]'),
      split: find('[data-split-mask]'),
      spot: find('[data-spotlight-sweep]'),
      deck: find('[data-depth-deck]'),
      colorize: find('[data-colorize-wipe]'),
      popup: find('[data-popup-fold]'),
      chat: find('[data-chat-replay]'),
    };
  });
  const kitParts = [];
  if (kitTargets.ruler >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), kitTargets.ruler);
    await driver.wait(100);
    const ok = await driver.evaluate(i => Boolean(window.__deck.slides[i].querySelector('[data-ruler-progress]')?._rpInit), kitTargets.ruler);
    if (ok) kitParts.push(`刻度尺推進（第 ${kitTargets.ruler + 1} 頁）`);
    else failures.push(`第 ${kitTargets.ruler + 1} 頁 [data-ruler-progress] 未初始化`);
  }
  if (kitTargets.bento >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), kitTargets.bento);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const root = window.__deck.slides[i].querySelector('[data-bento-expand]');
      const item = root?.querySelector('[data-bento-item]');
      if (!root || !item) return false;
      item.click();
      const opened = item.classList.contains('is-open') && window.__deck.index === i;
      item.click();
      const closed = !item.classList.contains('is-open');
      return opened && closed;
    }, kitTargets.bento);
    if (ok) kitParts.push(`看板展開（第 ${kitTargets.bento + 1} 頁）`);
    else failures.push(`第 ${kitTargets.bento + 1} 頁 [data-bento-expand] 點擊展開或防誤翻異常`);
  }
  if (kitTargets.rank >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), kitTargets.rank);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const el = window.__deck.slides[i].querySelector('[data-rank-race]');
      if (!el?._rrInit) return false;
      el._rrInit.show('before');
      const b = el.dataset.currentStage === 'before';
      el._rrInit.stop();
      return b && el.dataset.currentStage === 'after';
    }, kitTargets.rank);
    if (ok) kitParts.push(`排名超車（第 ${kitTargets.rank + 1} 頁）`);
    else failures.push(`第 ${kitTargets.rank + 1} 頁 [data-rank-race] 切換異常`);
  }
  if (kitTargets.odo >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), kitTargets.odo);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const el = window.__deck.slides[i].querySelector('[data-odometer]');
      if (!el?._odoInit) return false;
      window.__deck.toggleLowPower(true);
      const hasFinal = Boolean(el.querySelector('.odo-final')?.textContent?.trim());
      window.__deck.toggleLowPower(false);
      return hasFinal;
    }, kitTargets.odo);
    if (ok) kitParts.push(`滾輪數字（第 ${kitTargets.odo + 1} 頁）`);
    else failures.push(`第 ${kitTargets.odo + 1} 頁 [data-odometer] 靜態定格文字缺失`);
  }
  if (kitTargets.rack >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), kitTargets.rack);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const root = window.__deck.slides[i].querySelector('[data-rack-focus]');
      const item = root?.querySelector('[data-rf-item]');
      if (!root || !item) return false;
      item.click();
      const focused = item.classList.contains('is-focused') && window.__deck.index === i;
      item.click();
      const cleared = !item.classList.contains('is-focused');
      return focused && cleared;
    }, kitTargets.rack);
    if (ok) kitParts.push(`推鏡景深（第 ${kitTargets.rack + 1} 頁）`);
    else failures.push(`第 ${kitTargets.rack + 1} 頁 [data-rack-focus] 聚焦或防誤翻異常`);
  }
  if (kitTargets.spot >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), kitTargets.spot);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const el = window.__deck.slides[i].querySelector('[data-spotlight-sweep]');
      if (!el?._spInit) return false;
      window.__deck.toggleLowPower(true);
      const base = el.querySelector('.sp-base');
      const op = base ? parseFloat(getComputedStyle(base).opacity) : 0;
      window.__deck.toggleLowPower(false);
      return op >= 0.98;
    }, kitTargets.spot);
    if (ok) kitParts.push(`單次光掃（第 ${kitTargets.spot + 1} 頁）`);
    else failures.push(`第 ${kitTargets.spot + 1} 頁 [data-spotlight-sweep] 低耗電／靜態未復原滿亮`);
  }
  if (kitTargets.deck >= 0) {
    await driver.evaluate(i => window.__deck.go(i, true), kitTargets.deck);
    await driver.wait(100);
    const ok = await driver.evaluate(i => {
      const el = window.__deck.slides[i].querySelector('[data-depth-deck]');
      if (!el?._ddInit) return false;
      const first = el.querySelector('[data-deck-card]');
      first?.click();
      const stayed = window.__deck.index === i;
      el._ddInit.reset();
      return stayed;
    }, kitTargets.deck);
    if (ok) kitParts.push(`3D 景深疊卡（第 ${kitTargets.deck + 1} 頁）`);
    else failures.push(`第 ${kitTargets.deck + 1} 頁 [data-depth-deck] 互動或防誤翻異常`);
  }
  if (kitTargets.split >= 0 || kitTargets.colorize >= 0 || kitTargets.popup >= 0 || kitTargets.chat >= 0) {
    const simpleOk = await driver.evaluate(t => {
      const checks = [
        [t.split, '[data-split-mask]', '_smInit'],
        [t.colorize, '[data-colorize-wipe]', '_cwInit'],
        [t.popup, '[data-popup-fold]', '_pfInit'],
        [t.chat, '[data-chat-replay]', '_crInit'],
      ];
      return checks.every(([idx, sel, prop]) => idx < 0 || Boolean(window.__deck.slides[idx].querySelector(sel)?.[prop]));
    }, kitTargets);
    if (simpleOk) {
      if (kitTargets.split >= 0) kitParts.push(`文字斬切（第 ${kitTargets.split + 1} 頁）`);
      if (kitTargets.colorize >= 0) kitParts.push(`光掃上色（第 ${kitTargets.colorize + 1} 頁）`);
      if (kitTargets.popup >= 0) kitParts.push(`立體書翻折（第 ${kitTargets.popup + 1} 頁）`);
      if (kitTargets.chat >= 0) kitParts.push(`對話劇院（第 ${kitTargets.chat + 1} 頁）`);
    } else {
      failures.push('部分風格動態原語（split-mask / colorize-wipe / popup-fold / chat-replay）未正確初始化');
    }
  }
  if (kitParts.length) {
    results.push(`v4.7 風格動態套件實測（${kitParts.join('、')}）：通過（互動零誤翻、低耗電與靜態契約正常）`);
  }

  // 17. Live beforeprint / afterprint (without ?still=1): expand all data-step slides, clear transient focus/transform, restore after print
  const printTarget = await driver.evaluate(() => {
    const sls = window.__deck.slides;
    const stepIdx = sls.findIndex(s => s.dataset.appendix !== '1' && s.querySelector('[data-step], [data-step-only]'));
    return { slideIdx: stepIdx >= 0 ? stepIdx : 0, hasStep: stepIdx >= 0 };
  });
  await driver.evaluate(i => { window.__deck.go(i, true, { step: 0 }); }, printTarget.slideIdx);
  await driver.wait(80);
  const printRes = await driver.evaluate(() => {
    const preIdx = window.__deck.index;
    const preStep = window.__deck.stepIndex || 0;
    window.dispatchEvent(new Event('beforeprint'));
    const sls = window.__deck.slides;
    let unexpanded = 0;
    let staleFocus = 0;
    for (const sl of sls) {
      const nums = [...sl.querySelectorAll('[data-step], [data-step-only]')]
        .flatMap(el => [el.dataset.step, el.dataset.stepOnly, el.dataset.stepHide].map(v => parseInt(v || '0', 10)))
        .filter(n => !isNaN(n) && n > 0);
      const maxS = nums.length ? Math.max(...nums) : 0;
      if (maxS > 0 && Number(sl.dataset.currentStep || 0) !== maxS) unexpanded++;
      if (sl.classList.contains('is-focusing') || sl.querySelector('.focus-dim, .pre-transform')) staleFocus++;
    }
    window.dispatchEvent(new Event('afterprint'));
    const postIdx = window.__deck.index;
    const postStep = window.__deck.stepIndex || 0;
    return {
      ok: unexpanded === 0 && staleFocus === 0 && postIdx === preIdx && postStep === preStep,
      unexpanded, staleFocus, preIdx, postIdx, preStep, postStep,
    };
  });
  if (printRes.ok) {
    results.push(`活頁列印事件測試（beforeprint / afterprint${printTarget.hasStep ? `，含第 ${printTarget.slideIdx + 1} 頁多步展開與復原` : ''}）：通過`);
  } else {
    failures.push(`活頁列印事件異常：unexpanded=${printRes.unexpanded}, staleFocus=${printRes.staleFocus}, idx=${printRes.preIdx}->${printRes.postIdx}, step=${printRes.preStep}->${printRes.postStep}`);
  }

  const jsErrs = driver.getErrors();
  for (const e of jsErrs) failures.push(`動態測試期間腳本錯誤：${e}`);
  return { results, failures, warnings };
}

async function runDeckOrSingleMode(driver, targetFile, opts) {
  const filePath = path.resolve(targetFile);
  if (!fs.existsSync(filePath)) throw new Error(`找不到檔案：${filePath}`);

  driver.clearErrors();
  await driver.setViewport(1920, 1080);
  await driver.goto(pathToFileURL(filePath).href + '?still=1');
  await driver.addTempStyle('#hint, #toast, #ctrl-bar, #deck-progress { display: none !important; }', '__check_hide_hint');

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

  const liveliness = await driver.evaluate(() => {
    const sls = window.__deck.slides.filter(s => s.dataset.appendix !== '1');
    const stageMode = (window.__deck.stageMode || document.documentElement.dataset.stageMode || 'pitch').toLowerCase();
    const contentSlides = [];
    const primitives = new Set();
    const primChecks = [
      ['data-focus-plan', sl => sl.hasAttribute('data-focus-plan')],
      ['data-draw', sl => Boolean(sl.querySelector('[data-draw]'))],
      ['data-wipe', sl => Boolean(sl.querySelector('[data-wipe]'))],
      ['data-grow', sl => Boolean(sl.querySelector('[data-grow]'))],
      ['data-morph', sl => Boolean(sl.querySelector('[data-morph]'))],
      ['data-count', sl => Boolean(sl.querySelector('[data-count]'))],
      ['data-step', sl => Boolean(sl.querySelector('[data-step], [data-step-only]'))],
      ['data-transform-at', sl => Boolean(sl.querySelector('[data-transform-at]'))],
      // The 11 style-bound motion primitives are counted one by one: they are the dynamic
      // "extreme" of each style, and the style-fit line below checks the chosen style's own.
      ...['ruler-progress', 'bento-expand', 'rank-race', 'odometer', 'rack-focus', 'split-mask',
        'spotlight-sweep', 'depth-deck', 'colorize-wipe', 'popup-fold', 'chat-replay']
        .map(id => [id, sl => Boolean(sl.querySelector(`[data-${id}]`))]),
      ['interactive-module', sl => Boolean(sl.querySelector('[data-flow-carousel], [data-coverflow], [data-marquee], [data-compare-slider], [data-code-stage], [data-ref], [data-sound-ab], [data-sound-demo], [data-slide-video], .live-ctrl input[type="range"], [data-segmented], [data-toggle], [data-presets], [data-zoomable], [data-typewriter]'))],
    ];
    let visualCount = 0;
    let maxFlatStreak = 0;
    let curFlatStreak = 0;
    const flatSlides = [];
    const countVisibleChars = root => {
      let chars = 0;
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = tw.nextNode())) {
        const p = node.parentElement;
        if (!p || /^(STYLE|SCRIPT|NOSCRIPT|SVG)$/i.test(p.tagName) || p.closest('style, script, svg, nav, [data-auto-nav], [data-role="source"], .snav')) continue;
        chars += (node.nodeValue || '').replace(/\s+/g, '').length;
      }
      return chars;
    };
    sls.forEach((sl, idx) => {
      for (const [name, fn] of primChecks) if (fn(sl)) primitives.add(name);
      const kind = sl.dataset.kind || 'content';
      if (kind !== 'content') { curFlatStreak = 0; return; }
      const hasBigSvg = [...sl.querySelectorAll('svg')].some(g => {
        const vb = (g.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
        const w = parseFloat(g.getAttribute('width') || '0') || (vb[2] || 0);
        return w >= 120;
      });
      const hasMediaOrWidget = Boolean(sl.querySelector('img, .asset-slot, video, audio, table, [data-flow-carousel], [data-coverflow], [data-compare-slider], [data-code-stage], [data-ref], [data-marquee], [data-ruler-progress], [data-bento-expand], [data-rank-race], [data-odometer], [data-rack-focus], [data-split-mask], [data-spotlight-sweep], [data-depth-deck], [data-colorize-wipe], [data-popup-fold], [data-chat-replay], [data-zoomable], [data-typewriter], [data-sound-ab], [data-sound-demo], [data-toggle], [data-presets], .pillars, .device-browser, .device-frame, .device-phone, .device-tablet, .live-ctrl input[type="range"]'));
      const headings = [...sl.querySelectorAll('h1, h2, [data-role="title"]')];
      const maxHeadingPx = headings.reduce((m, el) => Math.max(m, parseFloat(getComputedStyle(el).fontSize) || 0), 0);
      const bodyEl = sl.querySelector('p:not([data-role="source"]), li, .lead, .sub');
      const bodyPx = bodyEl ? (parseFloat(getComputedStyle(bodyEl).fontSize) || 24) : 24;
      const visChars = countVisibleChars(sl);
      // Anti-card-itis fairness: frameless editorial spreads (35/65 split, quote chamber, giant display typography) count as visual craft
      const isEditorialCraft = sl.dataset.surface === 'split'
        || Boolean(sl.querySelector('blockquote, [data-archetype]'))
        || (maxHeadingPx >= 68 && bodyPx > 0 && maxHeadingPx / bodyPx >= 2.8 && visChars <= 70);
      const isVisual = hasBigSvg || hasMediaOrWidget || isEditorialCraft;
      const hasMotion = primChecks.some(([, fn]) => fn(sl));
      contentSlides.push({ slideNum: idx + 1, isVisual, hasMotion });
      if (isVisual) {
        visualCount++;
        curFlatStreak = 0;
      } else {
        curFlatStreak++;
        maxFlatStreak = Math.max(maxFlatStreak, curFlatStreak);
        flatSlides.push({ slideNum: idx + 1, score: hasMotion ? 1 : 0 });
      }
    });
    const totalContent = contentSlides.length;
    const visualRatio = totalContent ? Math.round((visualCount / totalContent) * 100) : 100;
    return {
      stageMode,
      style: String((window.DECK && window.DECK.style) || '').toLowerCase(),
      totalContent,
      visualCount,
      visualRatio,
      primitives: [...primitives],
      maxFlatStreak,
      polishCandidates: flatSlides.sort((a, b) => a.score - b.score).slice(0, 3).map(x => x.slideNum),
    };
  });

  const jsErrs = driver.getErrors();
  let motionReport = null;
  if (opts.motion) {
    motionReport = await runMotionAudit(driver, filePath, outDir);
  }

  const lines = [
    `# 品管報告：${path.basename(filePath)}`,
    '',
    `後端：${driver.name}｜共 ${count} 頁（\`?still=1\` 靜態定格實測），截圖在 \`check/\`。全簡報最低文字對比：${Number.isFinite(minDeckContrast) ? minDeckContrast.toFixed(2) + ':1' : '—'}。`,
    '',
  ];
  if (jsErrs.length) lines.push('## 主控台／腳本錯誤', ...jsErrs.map(e => `- ${e}`), '');
  const notices = typeof driver.getNotices === 'function' ? driver.getNotices() : [];
  if (notices.length) lines.push('## 提示', ...notices.map(n => `- ${n}`), '');
  if (problems.length) {
    lines.push('## 問題（需修正）');
    for (const p of problems) {
      lines.push(`- 第 ${p.slide} 頁（${p.kind}，最低對比 ${p.minContrast.toFixed(2)}:1）`);
      for (const x of p.issues) lines.push(`  - ${x}`);
    }
    lines.push('');
  } else if (!jsErrs.length) {
    lines.push('## 自動靜態檢查：全部通過', '', '接著請逐張看截圖（含步進分鏡條），確認美感、去贅字程度、斷行與主標題階層符合預期。', '');
  }
  if (liveliness && liveliness.totalContent > 0) {
    const mode = liveliness.stageMode || 'pitch';
    const minVis = mode === 'briefing' ? 40 : (mode === 'keynote' ? 75 : 55);
    const maxStreakAllow = mode === 'briefing' ? 3 : 2;
    const liveWarns = [];
    if (liveliness.visualRatio < minVis) {
      liveWarns.push(`視覺／圖表／互動內容頁佔比 ${liveliness.visualRatio}%（${mode} 建議 ≥ ${minVis}%）`);
    }
    if (liveliness.maxFlatStreak > maxStreakAllow) {
      liveWarns.push(`出現連續 ${liveliness.maxFlatStreak} 頁純文字無圖解頁面`);
    }
    const dna = loadStyleDna(liveliness.style);
    let fitLine;
    if (!dna || dna.status !== 'ready' || !dna.signature.length) {
      fitLine = `- 風格契合：略過（\`meta.style\`=${liveliness.style || '未設定'}，不是已就緒風格）`;
    } else {
      const usedSig = dna.signature.filter(id => liveliness.primitives.includes(id));
      fitLine = `- 風格動態觀測（\`${liveliness.style}\` 招牌原語：${dna.signature.join('、')}）：用到 **${usedSig.length}/${dna.signature.length}**${usedSig.length ? `（${usedSig.join('、')}）` : ''}`;
    }
    lines.push(`## 視覺圖解密度觀測（Liveliness Telemetry · \`stage_mode=${mode}\`）`);
    lines.push(`- 視覺／圖表／互動頁佔比：**${liveliness.visualCount}/${liveliness.totalContent}（${liveliness.visualRatio}%）**（參考基準 ≥ ${minVis}%）`);
    lines.push(`- 已啟用動態與互動原語（不設湊種類配額）：**${liveliness.primitives.length} 種**（${liveliness.primitives.join('、') || '基礎從容揭露'}）`);
    lines.push(fitLine);
    if (liveWarns.length) {
      for (const lw of liveWarns) lines.push(`- ⚠️ [WARN] ${lw}`);
      if (liveliness.polishCandidates.length) {
        lines.push(`- 建議單輪 Critic 優先檢視可圖解化之頁面：第 ${liveliness.polishCandidates.join('、')} 頁`);
      }
    } else {
      lines.push('- ✅ 達標：視覺圖解佔比與連續頁節奏符合場合基準。');
    }
    lines.push('');
  }
  if (motionReport) {
    lines.push('## 動態互動檢核（`--motion`）');
    for (const r of motionReport.results) lines.push(`- ✅ ${r}`);
    for (const w of (motionReport.warnings || [])) lines.push(`- ⚠️ [WARN] ${w}`);
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
