import { type UnixLauncherPlatforms, type UnixLauncherTargets } from "./types"

export const UNIX_LAUNCHER_VERSION = "v2"
export const UNIX_LAUNCHER_RELEASE_URL = "https://github.com/DavyMassoneto/synapse/releases/download/unix-launcher-v2/"
export const UNIX_LAUNCHER_CACHE = "synapse-unix-launcher"
export const UNIX_LAUNCHER_IDENTITY = "synapse-unix-launcher-v2"
export const UNIX_LAUNCHER_IDENTITY_ARGUMENT = "--identity"
export const UNIX_LAUNCHER_ASSET_BYTES = 4194304
export const UNIX_LAUNCHER_DOWNLOAD_MS = 30000
export const UNIX_LAUNCHER_PROBE_MS = 5000
export const UNIX_LAUNCHER_INVALID = "O launcher Unix não corresponde ao hash, protocolo ou relógio esperado."
export const UNIX_LAUNCHER_UNSUPPORTED = "Não há launcher Unix publicado para esta arquitetura."
export const UNIX_LAUNCHER_ASSETS: UnixLauncherTargets = {
  darwin: {
    name: "launcher-darwin-universal",
    sha256: "b5eaa553362a9d0fe9af5c7e28c430f8e8a423fe9829ce139af6bfe7ab281812",
    archiveSha256: "cab6ef38d1717831d61c44d9d17c42184ca751fa3920a5d71431d699d2225022",
  },
  linuxX64: {
    name: "launcher-linux-x86_64",
    sha256: "e95a6775291e1c86d14337421514a9da3884c5b35e2cc43036dc3bbbead3ed61",
    archiveSha256: "1db804e6bce7647cf4b1af9f655b385cbc992299ce91bc746728d7ba32ca5fe4",
  },
  linuxArm64: {
    name: "launcher-linux-aarch64",
    sha256: "ca2f2857eeeaf3b00ae1e0ed621a856704c18cb327330fd5c11d7abba7a3c105",
    archiveSha256: "a57f8f079d133dae8359176f0aa5619ee1e7edab9d87db0eede923594c47b428",
  },
}

export const UNIX_LAUNCHER_EXECUTABLE_MODE = 0o700

export const UNIX_LAUNCHER_EXECUTABLE_BYTES = 8388608
export const UNIX_LAUNCHER_ARCHIVE_EXTENSION = ".gz"

export const UNIX_LAUNCHER_IDENTITY_SEPARATOR = " "
export const UNIX_LAUNCHER_CLOCK_PATTERN = "^[0-9]+$"
export const UNIX_LAUNCHER_UTF8 = "utf8"

export const UNIX_LAUNCHER_CACHE_PARENT = ".cache"
export const UNIX_LAUNCHER_HASH = "sha256"
export const UNIX_LAUNCHER_HEX = "hex"
export const UNIX_LAUNCHER_MISSING = "ENOENT"
export const UNIX_LAUNCHER_EXISTS = "EEXIST"
export const UNIX_LAUNCHER_NOT_EMPTY = "ENOTEMPTY"
export const UNIX_LAUNCHER_DECIMAL = /^\d+$/
export const UNIX_LAUNCHER_CONTENT_LENGTH = "content-length"
export const UNIX_LAUNCHER_WRITE_FLAG = "wx"
export const UNIX_LAUNCHER_DARWIN = "darwin"
export const UNIX_LAUNCHER_LINUX = "linux"
export const UNIX_LAUNCHER_ARM64 = "arm64"
export const UNIX_LAUNCHER_X64 = "x64"

export const UNIX_LAUNCHER_UNSAFE_MODE = 0o022

export const UNIX_LAUNCHER_PLATFORM_FIELD = 1
export const UNIX_LAUNCHER_ARCHITECTURE_FIELD = 2
export const UNIX_LAUNCHER_CLOCK_FIELD = 3

export const UNIX_LAUNCHER_PLATFORM_ASSETS: UnixLauncherPlatforms = {
  darwin: { arm64: UNIX_LAUNCHER_ASSETS.darwin, x64: UNIX_LAUNCHER_ASSETS.darwin },
  linux: { arm64: UNIX_LAUNCHER_ASSETS.linuxArm64, x64: UNIX_LAUNCHER_ASSETS.linuxX64 },
}
