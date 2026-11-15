import { describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_ARM64,
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_UNSUPPORTED,
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
  COMPUTER_DRIVER_RELEASE_ASSET_MISSING,
  COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND,
  computerSelectDriverRelease,
  computerSelectDriverReleaseAsset,
} from "#synapse/modules/computer-use/adapters/driver-release/release-selection"
import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  COMPUTER_LINUX,
  type ComputerDriverPolicy,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION,
  COMPUTER_DRIVER_RELEASE_TEST_REASON,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_VERSION,
} from "./driver-release-constants"
import {
  computerReleaseTestAsset,
  computerReleaseTestOlderRelease,
  computerReleaseTestOtherRelease,
  computerReleaseTestRelease,
  computerReleaseTestStableRelease,
} from "./driver-release-fixtures"

function latestPolicy(): ComputerDriverPolicy {
  return { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE }
}

function pinnedPolicy(version: string): ComputerDriverPolicy {
  return { mode: COMPUTER_DRIVER_POLICY_MODE_PINNED, version, reason: COMPUTER_DRIVER_RELEASE_TEST_REASON }
}

function otherProductsIgnored(): void {
  const result = computerSelectDriverRelease({
    policy: latestPolicy(),
    releases: [
      computerReleaseTestOtherRelease(1, "cua-spaces-v9.9.9"),
      computerReleaseTestOtherRelease(2, "cua-bench-v9.9.9"),
      computerReleaseTestStableRelease(),
    ],
  })
  expect(result).toMatchObject({ kind: "release-selected", version: COMPUTER_DRIVER_RELEASE_TEST_VERSION })
}

function prereleaseFlagWithStableTagAccepted(): void {
  const result = computerSelectDriverRelease({
    policy: latestPolicy(),
    releases: [computerReleaseTestRelease(1, COMPUTER_DRIVER_RELEASE_TEST_TAG, [], false, true)],
  })
  expect(result).toMatchObject({ kind: "release-selected", version: COMPUTER_DRIVER_RELEASE_TEST_VERSION })
}

function prereleaseTagsExcluded(): void {
  const result = computerSelectDriverRelease({
    policy: latestPolicy(),
    releases: [
      computerReleaseTestOtherRelease(1, "cua-driver-rs-v0.52.0-rc.1"),
      computerReleaseTestOtherRelease(2, "cua-driver-rs-v0.52.0-nightly.20260101"),
      computerReleaseTestStableRelease(),
    ],
  })
  expect(result).toMatchObject({ kind: "release-selected", version: COMPUTER_DRIVER_RELEASE_TEST_VERSION })
}

function numericOrdering(): void {
  const result = computerSelectDriverRelease({
    policy: latestPolicy(),
    releases: [computerReleaseTestOtherRelease(1, "cua-driver-rs-v0.9.9"), computerReleaseTestStableRelease()],
  })
  expect(result).toMatchObject({ kind: "release-selected", version: COMPUTER_DRIVER_RELEASE_TEST_VERSION })
}

function draftExcluded(): void {
  const draft = computerReleaseTestRelease(1, "cua-driver-rs-v0.52.0", [], true, false)
  const result = computerSelectDriverRelease({
    policy: latestPolicy(),
    releases: [draft, computerReleaseTestStableRelease()],
  })
  expect(result).toMatchObject({ kind: "release-selected", version: COMPUTER_DRIVER_RELEASE_TEST_VERSION })
}

function pinnedSelectsExactVersion(): void {
  const result = computerSelectDriverRelease({
    policy: pinnedPolicy(COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION),
    releases: [computerReleaseTestStableRelease(), computerReleaseTestOlderRelease()],
  })
  expect(result).toMatchObject({ kind: "release-selected", version: COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION })
}

function pinnedMissingFails(): void {
  const result = computerSelectDriverRelease({
    policy: pinnedPolicy("0.21.0"),
    releases: [computerReleaseTestStableRelease()],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND })
}

function assetSelectedForTarget(): void {
  const result = computerSelectDriverReleaseAsset({
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    version: COMPUTER_DRIVER_RELEASE_TEST_VERSION,
    assets: [computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)],
  })
  expect(result).toStrictEqual({
    kind: "asset-selected",
    asset: { name: COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, digest: null },
  })
}

function missingTargetAssetFails(): void {
  const result = computerSelectDriverReleaseAsset({
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    version: COMPUTER_DRIVER_RELEASE_TEST_VERSION,
    assets: [computerReleaseTestAsset("cua-driver-rs-0.51.0-darwin-universal.tar.gz", null)],
  })
  expect(result).toStrictEqual({
    kind: "release-failed",
    message: `${COMPUTER_DRIVER_RELEASE_ASSET_MISSING} ${COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME}.`,
  })
}

function unsupportedArchitectureFails(): void {
  const result = computerSelectDriverReleaseAsset({
    platform: COMPUTER_LINUX,
    architecture: "ia32",
    version: COMPUTER_DRIVER_RELEASE_TEST_VERSION,
    assets: [computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)],
  })
  expect(result).toStrictEqual({
    kind: "release-failed",
    message: `${COMPUTER_DRIVER_RELEASE_ARCHITECTURE_UNSUPPORTED} ia32.`,
  })
}

function arm64AssetSelected(): void {
  const result = computerSelectDriverReleaseAsset({
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_ARM64,
    version: COMPUTER_DRIVER_RELEASE_TEST_VERSION,
    assets: [computerReleaseTestAsset("cua-driver-rs-0.51.0-linux-arm64-binary.tar.gz", null)],
  })
  expect(result).toStrictEqual({
    kind: "asset-selected",
    asset: { name: "cua-driver-rs-0.51.0-linux-arm64-binary.tar.gz", digest: null },
  })
}

describe("seleção da release do driver", () => {
  test("ignora releases de outros produtos", otherProductsIgnored)
  test("aceita flag prerelease do GitHub em tag SemVer estável", prereleaseFlagWithStableTagAccepted)
  test("exclui tags rc e nightly", prereleaseTagsExcluded)
  test("ordena versões numericamente", numericOrdering)
  test("exclui release draft", draftExcluded)
  test("seleciona a versão exata da pinagem", pinnedSelectsExactVersion)
  test("recusa pinagem sem release publicada", pinnedMissingFails)
  test("seleciona o asset do alvo", assetSelectedForTarget)
  test("seleciona o asset arm64 do alvo", arm64AssetSelected)
  test("recusa alvo sem asset publicado", missingTargetAssetFails)
  test("recusa arquitetura sem pacote", unsupportedArchitectureFails)
})
