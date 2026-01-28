#!/usr/bin/env sh
set -e
INSTALL_DIR=$1
MISE_VERSION=2026.1.7
ARCH=$(uname -m | sed 's/x86_64/x64/; s/aarch64/arm64/')
OS=$(uname -s | tr "[:upper:]" "[:lower:]" | sed 's/darwin/macos/')
LIBC=
if [ "linux" = "$OS" ]; then
	LIBC="-musl" # statically linked everywhere
fi
curl -fsSL https://github.com/jdx/mise/releases/download/v${MISE_VERSION}/mise-v${MISE_VERSION}-$OS-$ARCH$LIBC -o $INSTALL_DIR/mise
chmod 755 $INSTALL_DIR/mise
