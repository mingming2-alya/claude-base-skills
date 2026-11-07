#!/usr/bin/env bash
# claude-base-skills 安裝腳本（macOS）。可以重複執行，結果相同。
# 會改動：~/.claude/skills/ 下本 repo 的技能、~/.claude/CLAUDE.md 的標記區塊、
#         ~/.claude/settings.json 的 env、Claude Code 的外掛（ponytail、impeccable）、graphify CLI。
# 改動前的舊檔都會備份到 ~/.claude/backups/base-skills-<時間>/。
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
MARKET="claude-base-skills"
BACKUP="$CLAUDE_DIR/backups/base-skills-$(date +%Y%m%d-%H%M%S)"
GRAPHIFY_VERSION="$(cat "$REPO_DIR/skills/graphify/.graphify_version")"
TODO=""

say()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
ok()   { printf '  ✓ %s\n' "$*"; }
warn() { printf '  \033[33m! %s\033[0m\n' "$*"; }
todo() { TODO="$TODO\n  - $*"; warn "$*"; }
has()  { command -v "$1" >/dev/null 2>&1; }

say "1/6 檢查必要工具"
missing=""
has git  || missing="$missing git"
has node || missing="$missing node"
if [ -n "$missing" ]; then
  echo "缺少：$missing。請先執行：brew install$missing"; exit 1
fi
node_major="$(node -p 'process.versions.node.split(".")[0]')"
[ "$node_major" -ge 18 ] || { echo "Node 需要 18 以上，目前是 $(node -v)。請執行：brew upgrade node"; exit 1; }
ok "git、node $(node -v)"
if ! git -C "$REPO_DIR" diff --quiet HEAD 2>/dev/null; then
  warn "這個 repo 有未 commit 的修改；會照目前檔案安裝"
fi

say "2/6 備份現有設定到 $BACKUP"
mkdir -p "$BACKUP" "$CLAUDE_DIR/skills"
for f in CLAUDE.md settings.json; do
  if [ -f "$CLAUDE_DIR/$f" ]; then cp "$CLAUDE_DIR/$f" "$BACKUP/$f"; ok "$f"; fi
done

say "3/6 安裝技能到 $CLAUDE_DIR/skills"
count=0
for src in "$REPO_DIR"/skills/*/; do
  name="$(basename "$src")"
  dst="$CLAUDE_DIR/skills/$name"
  if [ -e "$dst" ]; then mkdir -p "$BACKUP/skills"; mv "$dst" "$BACKUP/skills/$name"; fi
  cp -R "$src" "$dst"
  count=$((count + 1))
done
ok "$count 個技能"

say "4/6 寫入全域規則與安全設定"
node "$REPO_DIR/scripts/lib/merge.js" claude-md "$CLAUDE_DIR/CLAUDE.md" "$REPO_DIR/rules/CLAUDE.base.md"
ok "CLAUDE.md 規則區塊"
node "$REPO_DIR/scripts/lib/merge.js" settings "$CLAUDE_DIR/settings.json"
ok "settings.json：IMPECCABLE_LIVE_COPY_AGENT=chat"
if [ -n "${GEMINI_API_KEY:-}${GOOGLE_API_KEY:-}" ]; then
  todo "你的 shell 設定了 GEMINI_API_KEY 或 GOOGLE_API_KEY：graphify 會把文件送到 Gemini，請從 ~/.zshrc 移除"
fi

say "5/6 安裝需要 hook 的外掛（ponytail、impeccable）"
if has claude; then
  if claude plugin marketplace list 2>/dev/null | grep -q "$MARKET"; then
    claude plugin marketplace update "$MARKET" >/dev/null && ok "marketplace 已更新為本 repo 目前版本"
  else
    claude plugin marketplace add "$REPO_DIR" >/dev/null && ok "已加入本機 marketplace：$MARKET"
  fi
  for p in ponytail impeccable; do
    if claude plugin list 2>/dev/null | grep -q "$p@$MARKET"; then
      claude plugin update "$p@$MARKET" >/dev/null 2>&1 || true
      ok "$p 已是本 repo 版本"
    elif claude plugin install "$p@$MARKET" --scope user >/dev/null; then
      ok "$p"
    else
      todo "$p 外掛安裝失敗：在 Claude Code 裡輸入 /plugin install $p@$MARKET"
    fi
  done
  other="$(claude plugin list 2>/dev/null | grep -E '(ponytail|impeccable|superpowers)@' | grep -v "@$MARKET" || true)"
  if [ -n "$other" ]; then
    todo "偵測到從上游 marketplace 裝的版本，會和鎖定版重複，請移除：$(echo "$other" | tr '\n' ' ')"
  fi
else
  todo "找不到 claude 指令。安裝 Claude Code 後在裡面輸入：/plugin marketplace add $REPO_DIR ，再 /plugin install ponytail@$MARKET 與 /plugin install impeccable@$MARKET"
fi

say "6/6 安裝 graphify CLI（鎖定 $GRAPHIFY_VERSION）"
if has uv; then
  uv tool install --quiet "graphifyy==$GRAPHIFY_VERSION" && ok "graphify $GRAPHIFY_VERSION"
else
  todo "找不到 uv：執行 brew install uv 後重跑本腳本，graphify 才能用"
fi

say "完成"
echo "  備份位置：$BACKUP"
echo "  重新開啟 Claude Code 後生效。第一次觸發 impeccable 時，它會下載並以 SHA-256 驗證自己的引擎。"
if [ -n "$TODO" ]; then
  printf '\n\033[33m還需要你處理：\033[0m%b\n' "$TODO"
fi
