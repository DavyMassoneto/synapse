import { type UnixLauncherTargets } from "./types"

export const UNIX_LAUNCHER_VERSION = "v1"
export const UNIX_LAUNCHER_RELEASE_URL = "https://github.com/DavyMassoneto/synapse/releases/download/unix-launcher-v1/"
export const UNIX_LAUNCHER_CACHE = "synapse-unix-launcher"
export const UNIX_LAUNCHER_IDENTITY = "synapse-unix-launcher-v1"
export const UNIX_LAUNCHER_IDENTITY_ARGUMENT = "--identity"
export const UNIX_LAUNCHER_ASSET_BYTES = 4194304
export const UNIX_LAUNCHER_DOWNLOAD_MS = 30000
export const UNIX_LAUNCHER_PROBE_MS = 5000
export const UNIX_LAUNCHER_INVALID = "O launcher Unix não corresponde ao hash, protocolo ou relógio esperado."
export const UNIX_LAUNCHER_UNSUPPORTED = "Não há launcher Unix publicado para esta arquitetura."
export const UNIX_LAUNCHER_ASSETS: UnixLauncherTargets = {
  darwin: {
    name: "launcher-darwin-universal",
    sha256: "0420807358c84769067a023aabe48705c8f1610ad4ba7a531fd60c2c15e440a3",
    archiveSha256: "ddeaddc4ed02a233c60a41db96aaebb8879114d39a9ebcbc5e1240a3c0b904fc",
  },
  linuxX64: {
    name: "launcher-linux-x86_64",
    sha256: "adf251693c76ce8e9bbc744613fe9c45add05b59ad8586b1511d9e1a96032448",
    archiveSha256: "a0918be112764d98506df8990ec2fcdc811b6f0f7b23484d5d74f6efd04ecffd",
  },
  linuxArm64: {
    name: "launcher-linux-aarch64",
    sha256: "3a15144885f4918dc0735b776ec84957addeb9562daa17f8a25cf51e5e496ca5",
    archiveSha256: "c26ec42c5bcced9ff855f2f378429afd33eeae96db51b7ddde397023a1a948a6",
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
