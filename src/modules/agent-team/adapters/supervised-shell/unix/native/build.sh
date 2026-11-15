#!/bin/sh
set -eu
: "${SYNAPSE_TOOLING:?Set SYNAPSE_TOOLING to the external tooling directory}"
: "${SYNAPSE_ZIG:?Set SYNAPSE_ZIG to the pinned Zig executable}"
SOURCE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SOURCE/build-constants.sh"
if [ "$("$SYNAPSE_ZIG" version)" != "$ZIG_VERSION" ]; then
  printf '%s\n' "$ZIG_VERSION_ERROR" >&2
  exit 1
fi
OUTPUT="$SYNAPSE_TOOLING/$LAUNCHER_BUILD_DIRECTORY"
mkdir -p "$OUTPUT"
export ZIG_GLOBAL_CACHE_DIR="$OUTPUT/$LAUNCHER_GLOBAL_CACHE"
export ZIG_LOCAL_CACHE_DIR="$OUTPUT/$LAUNCHER_LOCAL_CACHE"
for TARGET in $LAUNCHER_LINUX_ARCHITECTURES; do
  "$SYNAPSE_ZIG" cc -target "$TARGET-$LAUNCHER_LINUX_TARGET_SUFFIX" $LAUNCHER_COMMON_FLAGS $LAUNCHER_LINUX_FLAGS "$SOURCE"/*.c -o "$OUTPUT/launcher-linux-$TARGET"
done
xcrun clang $LAUNCHER_DARWIN_FLAGS $LAUNCHER_COMMON_FLAGS "$SOURCE"/*.c -o "$OUTPUT/$LAUNCHER_DARWIN_ASSET"
codesign --force --sign - --timestamp=none "$OUTPUT/$LAUNCHER_DARWIN_ASSET"
codesign --verify --verbose "$OUTPUT/$LAUNCHER_DARWIN_ASSET"
for BINARY in $LAUNCHER_ASSETS; do
  gzip -n -c "$OUTPUT/$BINARY" > "$OUTPUT/$BINARY.gz"
done
shasum -a 256 "$SOURCE"/*.c "$SOURCE"/*.h "$OUTPUT"/launcher-*
