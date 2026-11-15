import { describe, expect, test } from "vitest"
import { COMPUTER_DRIVER_RELEASE_TAGS_SELECTED } from "#synapse/modules/computer-use/adapters/driver-release"
import {
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_ARM64,
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_UNSUPPORTED,
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
  COMPUTER_DRIVER_RELEASE_ASSET_MISSING,
  COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND,
  computerSelectDriverReleaseAsset,
} from "#synapse/modules/computer-use/adapters/driver-release/release-selection"
import { computerSelectDriverReleaseTags } from "#synapse/modules/computer-use/adapters/driver-release/tag-refs"
import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  COMPUTER_LINUX,
  type ComputerDriverPolicy,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION,
  COMPUTER_DRIVER_RELEASE_TEST_REASON,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_VERSION,
} from "./driver-release-constants"
import { computerReleaseTestAsset, computerReleaseTestTagRef } from "./driver-release-fixtures"

function latestPolicy(): ComputerDriverPolicy {
  return { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE }
}

function pinnedPolicy(version: string): ComputerDriverPolicy {
  return { mode: COMPUTER_DRIVER_POLICY_MODE_PINNED, version, reason: COMPUTER_DRIVER_RELEASE_TEST_REASON }
}

function nonDriverRefsIgnored(): void {
  const result = computerSelectDriverReleaseTags({
    policy: latestPolicy(),
    refs: [
      "refs/tags/cua-spaces-v9.9.9",
      "refs/heads/cua-driver-rs-v9.9.9",
      computerReleaseTestTagRef(COMPUTER_DRIVER_RELEASE_TEST_TAG),
    ],
  })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_RELEASE_TAGS_SELECTED,
    version: COMPUTER_DRIVER_RELEASE_TEST_VERSION,
    tags: [COMPUTER_DRIVER_RELEASE_TEST_TAG],
  })
}

function prereleaseTagsExcluded(): void {
  const result = computerSelectDriverReleaseTags({
    policy: latestPolicy(),
    refs: [
      computerReleaseTestTagRef("cua-driver-rs-v0.52.0-rc.1"),
      computerReleaseTestTagRef("cua-driver-rs-v0.52.0-nightly.20260101"),
      computerReleaseTestTagRef(COMPUTER_DRIVER_RELEASE_TEST_TAG),
    ],
  })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_RELEASE_TAGS_SELECTED,
    version: COMPUTER_DRIVER_RELEASE_TEST_VERSION,
    tags: [COMPUTER_DRIVER_RELEASE_TEST_TAG],
  })
}

function numericOrdering(): void {
  const result = computerSelectDriverReleaseTags({
    policy: latestPolicy(),
    refs: [
      computerReleaseTestTagRef("cua-driver-rs-v0.9.9"),
      computerReleaseTestTagRef(COMPUTER_DRIVER_RELEASE_TEST_TAG),
    ],
  })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_RELEASE_TAGS_SELECTED,
    version: COMPUTER_DRIVER_RELEASE_TEST_VERSION,
    tags: [COMPUTER_DRIVER_RELEASE_TEST_TAG, "cua-driver-rs-v0.9.9"],
  })
}

function pinnedSelectsExactVersion(): void {
  const result = computerSelectDriverReleaseTags({
    policy: pinnedPolicy(COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION),
    refs: [
      computerReleaseTestTagRef(COMPUTER_DRIVER_RELEASE_TEST_TAG),
      computerReleaseTestTagRef(COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG),
    ],
  })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_RELEASE_TAGS_SELECTED,
    version: COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION,
    tags: [COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG],
  })
}

function pinnedMissingFails(): void {
  const result = computerSelectDriverReleaseTags({
    policy: pinnedPolicy("0.21.0"),
    refs: [computerReleaseTestTagRef(COMPUTER_DRIVER_RELEASE_TEST_TAG)],
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

describe("seleção das refs de release do driver", () => {
  test("ignora refs de outros produtos e de branches", nonDriverRefsIgnored)
  test("exclui tags rc e nightly", prereleaseTagsExcluded)
  test("ordena versões numericamente", numericOrdering)
  test("seleciona a versão exata da pinagem", pinnedSelectsExactVersion)
  test("recusa pinagem sem ref de tag publicada", pinnedMissingFails)
  test("seleciona o asset do alvo", assetSelectedForTarget)
  test("seleciona o asset arm64 do alvo", arm64AssetSelected)
  test("recusa alvo sem asset publicado", missingTargetAssetFails)
  test("recusa arquitetura sem pacote", unsupportedArchitectureFails)
})
