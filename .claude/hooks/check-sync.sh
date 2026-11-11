#!/usr/bin/env bash
# Stop hook：回合結束前檢查 repo 是否還有沒 commit 或沒推送的變更。
# 有的話以 exit 2 擋下結束，訊息會回給 Claude 去補 worklog、commit、push。
# 若這一輪已經被擋過一次（stop_hook_active=true），就不再擋，改成提醒使用者，避免無限迴圈（例如網路斷線推不上去）。
input=$(cat)
cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

msg=""
dirty=$(git status --porcelain)
if [ -n "$dirty" ]; then
  msg+="尚未 commit 的變更："$'\n'"$(printf '%s\n' "$dirty" | head -20)"$'\n'
fi
branch=$(git branch --show-current)
unpushed=$(git rev-list --count HEAD --not --remotes 2>/dev/null || echo 0)
# 淺克隆或單分支克隆推送後可能沒有本地追蹤參考，向遠端再確認一次
if [ "${unpushed:-0}" -gt 0 ] && [ -n "$branch" ]; then
  remote_sha=$(timeout 15 git ls-remote origin "refs/heads/$branch" 2>/dev/null | cut -f1)
  [ "$remote_sha" = "$(git rev-parse HEAD)" ] && unpushed=0
fi
if [ "${unpushed:-0}" -gt 0 ]; then
  msg+="尚未推送的 commit：${unpushed} 個（分支 $(git branch --show-current)）"$'\n'
fi
[ -z "$msg" ] && exit 0

if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  printf '[worklog 同步] 已提醒過一次，仍有未同步內容，請確認：\n%s' "$msg" >&2
  exit 1
fi
printf '[worklog 同步] 結束回合前請依 CLAUDE.md 更新 worklog/，然後 commit 並 git push -u origin <分支>：\n%s' "$msg" >&2
exit 2
