#!/usr/bin/env bash
# 把加掛技能放進某個專案：scripts/add-addon.sh <技能名> <專案資料夾>
# 例如：scripts/add-addon.sh hallmark ~/code/landing-page
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
name="${1:-}"; project="${2:-}"
if [ -z "$name" ] || [ -z "$project" ]; then
  echo "用法：$0 <技能名> <專案資料夾>"
  echo "可用的加掛技能：$(ls "$REPO_DIR/addons" | tr '\n' ' ')"
  exit 2
fi
src="$REPO_DIR/addons/$name"
[ -d "$src" ] || { echo "沒有這個加掛技能：$name"; exit 1; }
[ -d "$project" ] || { echo "找不到專案資料夾：$project"; exit 1; }

dst="$project/.claude/skills/$name"
mkdir -p "$project/.claude/skills"
rm -rf "$dst"
cp -R "$src" "$dst"
echo "已安裝 $name 到 $dst"
echo "記得把 .claude/skills/$name 一起 commit 進專案，版本才會跟著專案走。"
