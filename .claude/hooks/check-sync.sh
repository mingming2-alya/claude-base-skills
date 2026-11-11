#!/usr/bin/env bash
# Stop hook: block the end of a turn while this repo has work that is not committed or not pushed.
# The project rule (CLAUDE.md) says every finished step must be synced to the
# presentation-skill-generation branch. This hook is the safety net for that rule.
set -uo pipefail

input="$(cat)"
# Avoid an endless loop: if we already blocked once in this stop sequence, let it stop.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

repo="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$repo" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
problems=""

if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
  problems="有未 commit 的變更：$(git status --porcelain | head -5 | tr '\n' ' ')"
fi

if [ -n "$branch" ]; then
  # Shallow single-branch clones may have no local origin/<branch> ref even after a push,
  # so fall back to asking the remote directly.
  if git rev-parse --verify --quiet "@{u}" >/dev/null 2>&1; then
    remote_sha="$(git rev-parse "@{u}")"
  else
    remote_sha="$(timeout 20 git ls-remote origin "refs/heads/$branch" 2>/dev/null | cut -f1)"
  fi
  head_sha="$(git rev-parse HEAD)"
  if [ -z "$remote_sha" ]; then
    [ "$branch" != "main" ] && problems="$problems 分支 $branch 還沒推送到遠端。"
  elif [ "$remote_sha" != "$head_sha" ] && ! git merge-base --is-ancestor HEAD "$remote_sha" 2>/dev/null; then
    problems="$problems 有 commit 尚未推送到 origin/$branch。"
  fi
fi

if [ -n "$problems" ]; then
  reason="依專案規則（CLAUDE.md 規則一），段落結束前要把狀態、細節、輸入物、交付物同步到 presentation-skill-generation 分支。$problems 請更新 STATUS.md / LOG.md、commit 並 push 後再結束；若這些變更不該同步，加進 .gitignore 或刪除。"
  if [ "$branch" = "main" ]; then
    reason="$reason 注意：你目前在 main，這個專案的工作應該在 presentation-skill-generation 分支。"
  fi
  printf '{"decision":"block","reason":%s}\n' "$(printf '%s' "$reason" | jq -Rs . 2>/dev/null || printf '"%s"' "$reason")"
fi
exit 0
