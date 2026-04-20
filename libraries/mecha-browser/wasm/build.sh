#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="${SCRIPT_DIR}/../dist"

mkdir -p "$OUT_DIR"

echo "Building blobl.wasm..."
cd "$SCRIPT_DIR/blobl"
GOOS=js GOARCH=wasm go build -o "$OUT_DIR/blobl.wasm" .

# wasm_exec.js moved from misc/wasm/ to lib/wasm/ in Go 1.24+
WASM_EXEC_SRC="$(go env GOROOT)/lib/wasm/wasm_exec.js"
if [ ! -f "$WASM_EXEC_SRC" ]; then
  WASM_EXEC_SRC="$(go env GOROOT)/misc/wasm/wasm_exec.js"
fi
cp -f "$WASM_EXEC_SRC" "$OUT_DIR/wasm_exec.js"
chmod 644 "$OUT_DIR/wasm_exec.js"

echo "Built: $OUT_DIR/blobl.wasm ($(du -h "$OUT_DIR/blobl.wasm" | cut -f1))"
echo "Built: $OUT_DIR/wasm_exec.js"
