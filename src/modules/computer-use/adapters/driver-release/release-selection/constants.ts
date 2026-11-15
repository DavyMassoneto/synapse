import { type ComputerDriverReleasePlatformSuffixes } from "./types"

export const COMPUTER_DRIVER_RELEASE_TAG_PATTERN = /^cua-driver-rs-v(\d+)\.(\d+)\.(\d+)$/

export const COMPUTER_DRIVER_RELEASE_ASSET_PREFIX = "cua-driver-rs-"

export const COMPUTER_DRIVER_RELEASE_ARCHITECTURE_ARM64 = "arm64"

export const COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64 = "x64"

export const COMPUTER_DRIVER_RELEASE_VERSION_FOUND = "release-version-found"

export const COMPUTER_DRIVER_RELEASE_VERSION_ABSENT = "release-version-absent"

export const COMPUTER_DRIVER_RELEASE_SELECTED = "release-selected"

export const COMPUTER_DRIVER_RELEASE_ASSET_SELECTED = "asset-selected"

export const COMPUTER_DRIVER_RELEASE_NOT_FOUND = "Nenhuma release estável do cua-driver foi encontrada."

export const COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND =
  "A release fixada do cua-driver não foi encontrada entre as releases publicadas."

export const COMPUTER_DRIVER_RELEASE_ARCHITECTURE_UNSUPPORTED = "Não há pacote do cua-driver para a arquitetura"

export const COMPUTER_DRIVER_RELEASE_ASSET_MISSING = "A release do cua-driver não publica o pacote esperado para"

export const COMPUTER_DRIVER_RELEASE_ASSET_SUFFIXES: ComputerDriverReleasePlatformSuffixes = {
  darwin: {
    arm64: "darwin-universal.tar.gz",
    x64: "darwin-universal.tar.gz",
  },
  linux: {
    arm64: "linux-arm64-binary.tar.gz",
    x64: "linux-x86_64-binary.tar.gz",
  },
  win32: {
    arm64: "windows-arm64-binary.zip",
    x64: "windows-x86_64-binary.zip",
  },
}
