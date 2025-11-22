#!/bin/sh
set -e

if ! pgrep -x "pgstream" >/dev/null 2>&1; then
  echo "pgstream process not running" >&2
  exit 1
fi