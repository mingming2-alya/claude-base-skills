#!/usr/bin/env bash
# 依 versions.lock 從上游的指定 commit 複製檔案進本 repo。
# 只有在你審過 review-updates.sh 的報告、改過 versions.lock 之後才需要跑。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="${VENDOR_CACHE:-$ROOT/.vendor-cache}"
mkdir -p "$CACHE" "$ROOT/LICENSES"

cache_dir() { echo "$CACHE/$(echo "$1" | tr '/' '_')"; }

ensure_commit() { # repo commit
  local dir; dir="$(cache_dir "$1")"
  if [ ! -d "$dir/.git" ]; then
    git clone --quiet "https://github.com/$1" "$dir"
  fi
  if ! git -C "$dir" cat-file -e "$2^{commit}" 2>/dev/null; then
    git -C "$dir" fetch --quiet origin "$2" 2>/dev/null || git -C "$dir" fetch --quiet --unshallow origin 2>/dev/null || git -C "$dir" fetch --quiet origin
  fi
  git -C "$dir" cat-file -e "$2^{commit}" || { echo "找不到 $1@$2" >&2; exit 1; }
}

seen_repos=""
while read -r name repo commit src dst; do
  case "$name" in ''|'#'*) continue ;; esac
  ensure_commit "$repo" "$commit"
  dir="$(cache_dir "$repo")"
  tmp="$(mktemp -d)"
  git -C "$dir" archive "$commit" -- "$src" | tar -x -C "$tmp"
  [ -e "$tmp/$src" ] || { echo "上游沒有這個路徑：$repo@$commit:$src" >&2; exit 1; }
  rm -rf "${ROOT:?}/$dst"
  mkdir -p "$(dirname "$ROOT/$dst")"
  mv "$tmp/$src" "$ROOT/$dst"
  rm -rf "$tmp"
  echo "  $name  ->  $dst"

  case " $seen_repos " in
    *" $repo@$commit "*) ;;
    *)
      seen_repos="$seen_repos $repo@$commit"
      lic="$ROOT/LICENSES/$(echo "$repo" | tr '/' '_')"
      rm -rf "$lic"; mkdir -p "$lic"
      for f in $(git -C "$dir" ls-tree --name-only "$commit" | grep -E '^(LICENSE|NOTICE)' || true); do
        git -C "$dir" show "$commit:$f" > "$lic/$f"
      done
      echo "$repo $commit" > "$lic/SOURCE"
      ;;
  esac

  # graphify CLI 會比對技能資料夾裡的版本戳記，戳記和 CLI 同版就不會自動覆寫技能
  if [ "$name" = "graphify-skill" ]; then
    git -C "$dir" show "$commit:pyproject.toml" | sed -n 's/^version = "\(.*\)"/\1/p' | head -1 | tr -d '\n' > "$ROOT/skills/graphify/.graphify_version"
  fi
done < "$ROOT/versions.lock"

echo "完成。記得 git diff 檢查後再 commit。"
