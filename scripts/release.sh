#!/usr/bin/env bash
# Tiny release helper.
#   scripts/release.sh major|minor|patch   bump the semver component, update package.json and the README, tag and push
#   scripts/release.sh --check             verify every v* tag has a GitHub release and the README names the latest version
# Pushing the tag triggers .github/workflows/release.yml, which builds the extension and creates the GitHub release
# (with generated release notes and finder-finder.tar.gz attached).
set -euo pipefail
cd "$(dirname "$0")/.."

latest_tag() { git tag --list 'v*' --sort=-v:refname | head -n1; }

readme_version() { sed -n 's/^Current version: \[v\([^]]*\)\].*/\1/p' README.md; }

check() {
  local ok=0 tag latest; latest=$(latest_tag)
  if command -v gh >/dev/null 2>&1; then
    for tag in $(git tag --list 'v*'); do
      gh release view "$tag" >/dev/null 2>&1 || { echo "✗ tag $tag has no GitHub release"; ok=1; }
    done
  else
    echo "! gh not found, skipping the GitHub release check"
  fi
  if [ -n "$latest" ] && [ "$(readme_version)" != "${latest#v}" ]; then
    echo "✗ README says '$(readme_version)', latest tag is $latest"; ok=1
  fi
  [ "$ok" -eq 0 ] && echo "✓ releases and README are up to date"
  return "$ok"
}

bump() {
  local part=$1 current major minor patch next
  [ -z "$(git status --porcelain)" ] || { echo "Working tree is not clean" >&2; exit 1; }
  [ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "Release from main" >&2; exit 1; }
  git pull --ff-only origin main
  current=$(latest_tag); current=${current#v}; current=${current:-0.0.0}
  IFS=. read -r major minor patch <<<"$current"
  case $part in
    major) next="$((major + 1)).0.0" ;;
    minor) next="$major.$((minor + 1)).0" ;;
    patch) next="$major.$minor.$((patch + 1))" ;;
  esac
  echo "==> $current -> $next"

  npm version "$next" --no-git-tag-version >/dev/null
  # README: the line between the markers always names the latest release and links to its notes
  local repo; repo=$(git remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
  local line="Current version: [v$next](https://github.com/$repo/releases/tag/v$next) ([all release notes](https://github.com/$repo/releases))"
  sed -i.bak "/<!-- release:start -->/,/<!-- release:end -->/{/^Current version:/c\\
$line
}" README.md && rm -f README.md.bak

  git add package.json package-lock.json README.md
  git commit -m "Release v$next"
  git tag -a "v$next" -m "v$next"
  git push origin main "v$next"
  echo "==> Pushed v$next. The Release workflow now builds it and creates the GitHub release:"
  echo "    gh run watch   # then: scripts/release.sh --check"
}

case ${1-} in
  --check) check ;;
  major|minor|patch) bump "$1" ;;
  *) sed -n '2,6p' "$0" | sed 's/^# \{0,1\}//' >&2; exit 2 ;;
esac
