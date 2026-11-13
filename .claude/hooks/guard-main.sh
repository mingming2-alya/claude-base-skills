#!/bin/sh
# PreToolUse（Bash）hook：只允許在工作分支上提交與推送。
# 擋下：在 main/master 上 commit、push、merge、rebase、cherry-pick；以及任何推送到 main/master 的 push。
input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)
case "$cmd" in *git*) ;; *) exit 0 ;; esac

deny() {
  jq -n --arg r "$1" '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $r}}'
  exit 0
}

if printf '%s' "$cmd" | grep -Eq 'git[^;&|]*[[:space:]]push[^;&|]*([[:space:]:/])(main|master)([[:space:];&|]|$)'; then
  deny "這個專案只更新在工作分支，不推送到 main/master（CLAUDE.md「只更新在工作分支」）。需要合併時請開 PR 或由你本人操作。"
fi

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
branch=$(git symbolic-ref --short -q HEAD 2>/dev/null)
case "$branch" in
  main|master)
    if printf '%s' "$cmd" | grep -Eq 'git[^;&|]*[[:space:]](commit|push|merge|rebase|cherry-pick)([[:space:]]|$)'; then
      deny "目前在 $branch 上。先用 git checkout -b claude/<任務名> 開工作分支，再提交或推送。"
    fi ;;
esac
exit 0
