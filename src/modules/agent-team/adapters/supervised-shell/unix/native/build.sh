#!/bin/sh
set -eu
: "${SYNAPSE_TOOLING:?Set SYNAPSE_TOOLING to the external tooling directory}"
: "${SYNAPSE_ZIG:?Set SYNAPSE_ZIG to the pinned Zig executable}"
if [ "$("$SYNAPSE_ZIG" version)" != "0.17.1" ]; then
  printf '%s\n' 'Expected pinned Zig 0.17.1' >&2
  exit 1
fi
SOURCE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUTPUT="$SYNAPSE_TOOLING/synapse-unix-launcher-v1"
mkdir -p "$OUTPUT"
export ZIG_GLOBAL_CACHE_DIR="$OUTPUT/zig-global-cache"
export ZIG_LOCAL_CACHE_DIR="$OUTPUT/zig-local-cache"
for TARGET in x86_64 aarch64; do
  "$SYNAPSE_ZIG" cc -target "$TARGET-linux-musl" -static -O2 -g0 -s -fno-ident -D_POSIX_C_SOURCE=200809L -Werror -Wall -Wextra -Wl,--build-id=none "$SOURCE"/*.c -o "$OUTPUT/launcher-linux-$TARGET"
done
xcrun clang -arch arm64 -arch x86_64 -O2 -g0 -D_POSIX_C_SOURCE=200809L -Werror -Wall -Wextra -mmacosx-version-min=11.0 "$SOURCE"/*.c -o "$OUTPUT/launcher-darwin-universal"
codesign --force --sign - --timestamp=none "$OUTPUT/launcher-darwin-universal"
codesign --verify --verbose "$OUTPUT/launcher-darwin-universal"
for BINARY in launcher-darwin-universal launcher-linux-x86_64 launcher-linux-aarch64; do
  gzip -n -c "$OUTPUT/$BINARY" > "$OUTPUT/$BINARY.gz"
done
shasum -a 256 "$SOURCE"/*.c "$SOURCE"/*.h "$OUTPUT"/launcher-*
