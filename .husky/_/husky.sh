#!/bin/sh

# Shamelessly adapted from Husky init script; ensures nvm/pnpm env is loaded.
if [ -f ~/.nvm/nvm.sh ]; then
  . ~/.nvm/nvm.sh
fi

if command -v pnpm >/dev/null 2>&1; then
  :
else
  echo "pnpm not found; skipping Husky hook." >&2
  exit 0
fi
