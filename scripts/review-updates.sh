#!/usr/bin/env bash
# 每月更新審查：比對 versions.lock 鎖定的 commit 與上游最新版，產出 reviews/<年-月>.md。
# 這個腳本只讀不改：它不會更新任何技能。審過報告後，要接受更新就改 versions.lock 的 commit，
# 再跑 scripts/vendor.sh、git commit、scripts/install.sh。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="${VENDOR_CACHE:-$ROOT/.vendor-cache}"
REPORT="$ROOT/reviews/$(date +%Y-%m).md"
mkdir -p "$CACHE" "$ROOT/reviews"

# 新增的程式碼裡出現這些字樣，就列進「需要人看」的清單
RISK='https?://|curl |wget |fetch\(|XMLHttpRequest|child_process|execSync|spawn\(|eval\(|dangerously|bypassPermissions|--no-sandbox|skip-permissions|telemetry|analytics|webhook|"hooks"|PreToolUse|PostToolUse|SessionStart|UserPromptSubmit|API_KEY|TOKEN'

{
  echo "# 技能更新審查 $(date +%Y-%m-%d)"
  echo
  echo "每一列：鎖定版 → 上游最新版。只有「有變更」的項目需要看；「風險字樣」列出新增行裡命中的關鍵字，逐條判斷是否可以接受。"
  echo
} > "$REPORT"

checked=""
while read -r name repo commit src dst; do
  case "$name" in ''|'#'*) continue ;; esac
  dir="$CACHE/$(echo "$repo" | tr '/' '_')"
  case " $checked " in *" $repo "*) ;; *)
    checked="$checked $repo"
    if [ ! -d "$dir/.git" ]; then git clone --quiet "https://github.com/$repo" "$dir"; fi
    git -C "$dir" fetch --quiet origin
    git -C "$dir" remote set-head origin --auto >/dev/null 2>&1 || true
  ;; esac
  latest="$(git -C "$dir" rev-parse origin/HEAD)"
  if [ "$latest" = "$commit" ]; then
    echo "- **$name**：沒有新版" >> "$REPORT"; continue
  fi
  if ! git -C "$dir" cat-file -e "$commit^{commit}" 2>/dev/null; then
    git -C "$dir" fetch --quiet --unshallow origin 2>/dev/null || git -C "$dir" fetch --quiet origin "$commit"
  fi
  stat="$(git -C "$dir" diff --shortstat "$commit" "$latest" -- "$src")"
  if [ -z "$stat" ]; then
    echo "- **$name**：上游有新 commit，但這個路徑沒變（可直接把 commit 改成 \`$latest\`）" >> "$REPORT"; continue
  fi
  {
    echo
    echo "## $name（有變更）"
    echo
    echo "- 上游：https://github.com/$repo/compare/${commit:0:12}...${latest:0:12}"
    echo "- 新 commit：\`$latest\`"
    echo "- 變更量：$stat"
    echo "- 變更的檔案："
    git -C "$dir" diff --name-status "$commit" "$latest" -- "$src" | sed 's/^/    /'
    hits="$(git -C "$dir" diff "$commit" "$latest" -- "$src" | grep '^+' | grep -v '^+++' | grep -Eo "$RISK" | sort | uniq -c | sort -rn || true)"
    if [ -n "$hits" ]; then
      echo "- 風險字樣（新增行裡出現的次數）："
      echo "$hits" | sed 's/^/    /'
    else
      echo "- 風險字樣：無"
    fi
  } >> "$REPORT"
done < "$ROOT/versions.lock"

echo "報告：$REPORT"
echo "下一步：把報告交給 Claude 一起審，例如「幫我審 reviews/$(date +%Y-%m).md，逐條判斷能不能更新」。"
