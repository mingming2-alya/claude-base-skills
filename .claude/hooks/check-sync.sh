#!/bin/sh
# Stop hook：回合結束前檢查 repo 是否有還沒提交或還沒推送的變更。
# 有的話擋下這次結束（decision: block），要求先同步到工作分支。
# 同一回合第二次觸發（stop_hook_active=true）時只提醒、不再擋，避免無限迴圈。
input=$(cat)
active=$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

nl='
'
branch=$(git symbolic-ref --short -q HEAD || echo "(detached HEAD)")
problems=""

case "$branch" in
  main|master)
    problems="目前在 $branch 上。任務紀錄只能更新在工作分支：先開一條 claude/<任務名> 分支再提交。$nl" ;;
esac

dirty=$(git status --porcelain)
if [ -n "$dirty" ]; then
  problems="${problems}有還沒提交的變更：$nl$(printf '%s\n' "$dirty" | head -20)$nl"
fi

if git rev-parse -q --verify '@{u}' >/dev/null 2>&1; then
  ahead=$(git rev-list --count '@{u}..HEAD')
  if [ "$ahead" -gt 0 ]; then
    problems="${problems}有 $ahead 個 commit 還沒推送到 $(git rev-parse --abbrev-ref '@{u}')。$nl"
  fi
else
  ahead=$(git rev-list --count HEAD --not --remotes 2>/dev/null || echo 0)
  if [ "$ahead" -gt 0 ]; then
    problems="${problems}分支 $branch 沒有遠端追蹤分支，有 $ahead 個 commit 還沒推送（用 git push -u origin $branch）。$nl"
  fi
fi

[ -z "$problems" ] && exit 0

if [ "$active" = "true" ]; then
  jq -n --arg m "任務紀錄仍未完全同步到 repo：$nl$problems" '{systemMessage: $m}'
  exit 0
fi

jq -n --arg r "結束回合前請先依 CLAUDE.md「任務進度同步」把狀態、執行細節、輸入與產出更新到 tasks/，commit 並 push 到工作分支（不可推到 main）。目前狀況：$nl$problems" \
  '{decision: "block", reason: $r}'
