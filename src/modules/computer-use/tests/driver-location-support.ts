import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import {
  COMPUTER_DRIVER_BINARY_FOLDERS,
  computerDriverExecutablePath,
  computerExecutableDigest,
  computerWriteDriverReceipt,
} from "#synapse/modules/computer-use/adapters/driver-location"
import { COMPUTER_LINUX, type ComputerDriverReleaseSelection } from "#synapse/modules/computer-use/public/contracts"

export const COMPUTER_DRIVER_LOCATION_TEST_PREFIX = "computer-driver-location-"
export const COMPUTER_DRIVER_LOCATION_TEST_VERSION = "0.49.7"
export const COMPUTER_DRIVER_LOCATION_TEST_OTHER_VERSION = "0.51.0"
export const COMPUTER_DRIVER_LOCATION_TEST_BINARY_CONTENT = "#!/bin/sh\nexit 0\n"
export const COMPUTER_DRIVER_LOCATION_TEST_ALTERED_CONTENT = "#!/bin/sh\nexit 1\n"
export const COMPUTER_DRIVER_LOCATION_TEST_SCRIPT_MODE = 0o755
export const COMPUTER_DRIVER_LOCATION_TEST_FILES = 1

export function computerLocationTestSelection(version: string): ComputerDriverReleaseSelection {
  return {
    releaseId: 445714089,
    tag: `cua-driver-rs-v${version}`,
    version,
    platform: COMPUTER_LINUX,
    architecture: "x64",
    assetName: "linux-x86_64-binary.tar.gz",
    assetUrl: `https://example.invalid/v${version}/linux-x86_64-binary.tar.gz`,
    expectedSha256: "a".repeat(64),
    checksumSource: "github-asset-digest",
  }
}

export function computerLocationTestInstallation(
  directory: string,
  selection: ComputerDriverReleaseSelection,
  content: string,
): string {
  const versionDirectory = join(directory, selection.version)
  mkdirSync(versionDirectory, { recursive: true })
  const binary = join(versionDirectory, ...COMPUTER_DRIVER_BINARY_FOLDERS[selection.platform])
  writeFileSync(binary, content, { mode: COMPUTER_DRIVER_LOCATION_TEST_SCRIPT_MODE })
  computerWriteDriverReceipt(versionDirectory, {
    version: selection.version,
    tag: selection.tag,
    releaseId: selection.releaseId,
    assetName: selection.assetName,
    expectedSha256: selection.expectedSha256,
    checksumSource: selection.checksumSource,
    platform: selection.platform,
    architecture: selection.architecture,
    executable: computerDriverExecutablePath(selection.platform),
    executableSha256: computerExecutableDigest(binary),
    policy: { mode: "latest-stable" },
  })
  return binary
}
