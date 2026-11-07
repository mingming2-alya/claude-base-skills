#!/usr/bin/env node
// 給 install.sh 用的兩個小工具：
//   merge.js claude-md <CLAUDE.md 路徑> <規則檔>   以標記包住的區塊寫入或替換規則，區塊外的內容不動
//   merge.js settings  <settings.json 路徑>        在 env 裡設定 impeccable 的安全值，回報危險設定
'use strict';
const fs = require('fs');

const [, , cmd, target, source] = process.argv;
const BEGIN = '<!-- BEGIN claude-base-skills -->';
const END = '<!-- END claude-base-skills -->';

function readOr(path, fallback) {
  try { return fs.readFileSync(path, 'utf8'); } catch (e) { if (e.code === 'ENOENT') return fallback; throw e; }
}

function writeAtomic(path, text) {
  const tmp = `${path}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, path);
}

if (cmd === 'claude-md') {
  const rules = fs.readFileSync(source, 'utf8').trim();
  const block = `${BEGIN}\n${rules}\n${END}`;
  const current = readOr(target, '');
  const start = current.indexOf(BEGIN);
  const end = current.indexOf(END);
  let next;
  if (start !== -1 && end > start) {
    next = current.slice(0, start) + block + current.slice(end + END.length);
  } else if (start !== -1 || end !== -1) {
    console.error(`${target} 裡的 claude-base-skills 標記不成對，請手動修正後再跑`);
    process.exit(1);
  } else {
    next = current.trimEnd() + (current.trim() ? '\n\n' : '') + block + '\n';
  }
  writeAtomic(target, next);
} else if (cmd === 'settings') {
  const raw = readOr(target, '{}').replace(/^﻿/, '');
  let settings;
  try { settings = raw.trim() ? JSON.parse(raw) : {}; } catch (e) {
    console.error(`${target} 不是有效的 JSON，沒有修改：${e.message}`);
    process.exit(1);
  }
  settings.env = settings.env || {};
  settings.env.IMPECCABLE_LIVE_COPY_AGENT = 'chat';
  const risky = ['GEMINI_API_KEY', 'GOOGLE_API_KEY'].filter((k) => settings.env[k]);
  if (risky.length) console.log(`WARN settings.json 的 env 有 ${risky.join('、')}：graphify 會把文件送到 Gemini，建議移除`);
  writeAtomic(target, JSON.stringify(settings, null, 2) + '\n');
} else {
  console.error('用法：merge.js claude-md <CLAUDE.md> <rules.md> | merge.js settings <settings.json>');
  process.exit(2);
}
