#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/new-article.sh "Your Article Title"
  scripts/new-article.sh <section> "Your Post Title"
  scripts/new-article.sh --section <section> "Your Post Title"

Sections:
  articles (default), music, books, movies

Examples:
  scripts/new-article.sh "A New Blog Post"
  scripts/new-article.sh music "Songs on Repeat"
  scripts/new-article.sh --section books "The Stranger"
EOF
}

normalize_section() {
  case "$1" in
    article|articles) echo "articles" ;;
    music|song|songs) echo "music" ;;
    book|books|literature) echo "books" ;;
    movie|movies|film|films) echo "movies" ;;
    *) return 1 ;;
  esac
}

section="articles"

if [ "$#" -eq 0 ]; then
  usage
  exit 1
fi

if [ "${1:-}" = "-s" ] || [ "${1:-}" = "--section" ]; then
  if [ "$#" -lt 3 ]; then
    usage
    exit 1
  fi
  section=$(normalize_section "$2") || {
    echo "Unknown section: $2"
    usage
    exit 1
  }
  shift 2
elif normalize_section "${1:-}" >/dev/null 2>&1 && [ "$#" -ge 2 ]; then
  section=$(normalize_section "$1")
  shift
fi

if [ "$#" -lt 1 ]; then
  usage
  exit 1
fi

title="$*"
slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')
date=$(date +%Y-%m-%d)
dir="content/$section"
mkdir -p "$dir"
file="$dir/${date}-${slug}.md"

if [ -e "$file" ]; then
  echo "File already exists: $file"
  exit 1
fi

cat > "$file" <<EOT
+++
title = "$title"
date = $date
draft = false
tags = []
+++

Write here.
EOT

echo "Created $file"
