import { describe, expect, test } from "vitest"
import { computerResolveDriverRelease } from "#synapse/modules/computer-use/adapters/driver-release"
import {
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS as CHECKSUM_ASSET,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING,
} from "#synapse/modules/computer-use/adapters/driver-release/checksum-reading"
import {
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
  COMPUTER_DRIVER_RELEASE_ASSET_MISSING,
  COMPUTER_DRIVER_RELEASE_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND,
} from "#synapse/modules/computer-use/adapters/driver-release/release-selection"
import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  COMPUTER_LINUX,
  type ComputerDriverPolicy,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DRIVER_RELEASE_TEST_API_URL,
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION,
  COMPUTER_DRIVER_RELEASE_TEST_REASON,
  COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_UNPUBLISHED_TAG,
} from "./driver-release-constants"
import {
  computerReleaseTestAsset,
  computerReleaseTestRelease,
  computerReleaseTestReleaseRoute,
  computerReleaseTestTagRefsRoute,
} from "./driver-release-fixtures"
import { ComputerFakeReleaseHttp } from "./driver-release-support"
import { type ComputerReleaseTestRoute } from "./driver-release-types"

function latestPolicy(): ComputerDriverPolicy {
  return { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE }
}

function pinnedPolicy(version: string): ComputerDriverPolicy {
  return { mode: COMPUTER_DRIVER_POLICY_MODE_PINNED, version, reason: COMPUTER_DRIVER_RELEASE_TEST_REASON }
}

function missingReleaseRoute(apiUrl: string, tag: string): ComputerReleaseTestRoute {
  return {
    url: `${apiUrl}/tags/${tag}`,
    status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_FOUND,
    body: "",
  }
}

async function missingTargetAssetFails(): Promise<void> {
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [computerReleaseTestAsset(CHECKSUM_ASSET, null)],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [COMPUTER_DRIVER_RELEASE_TEST_TAG]),
    computerReleaseTestReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, release),
  ])
  const result = await computerResolveDriverRelease({
    fetch: fake.fetch,
    policy: latestPolicy(),
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({
    kind: "release-failed",
    message: `${COMPUTER_DRIVER_RELEASE_ASSET_MISSING} ${COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME}.`,
  })
}

async function missingChecksumSourceFails(): Promise<void> {
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [COMPUTER_DRIVER_RELEASE_TEST_TAG]),
    computerReleaseTestReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, release),
  ])
  const result = await computerResolveDriverRelease({
    fetch: fake.fetch,
    policy: latestPolicy(),
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING })
}

async function pinnedMissingTagFails(): Promise<void> {
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [COMPUTER_DRIVER_RELEASE_TEST_TAG]),
  ])
  const result = await computerResolveDriverRelease({
    fetch: fake.fetch,
    policy: pinnedPolicy(COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION),
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND })
}

async function pinnedTagWithoutReleaseFails(): Promise<void> {
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG]),
    missingReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG),
  ])
  const result = await computerResolveDriverRelease({
    fetch: fake.fetch,
    policy: pinnedPolicy(COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION),
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND })
}

async function unpublishedTagsFail(): Promise<void> {
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [
      COMPUTER_DRIVER_RELEASE_TEST_UNPUBLISHED_TAG,
    ]),
    missingReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, COMPUTER_DRIVER_RELEASE_TEST_UNPUBLISHED_TAG),
  ])
  const result = await computerResolveDriverRelease({
    fetch: fake.fetch,
    policy: latestPolicy(),
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_NOT_FOUND })
}

async function pinnedDraftFails(): Promise<void> {
  const draft = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
    [],
    true,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG]),
    computerReleaseTestReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, draft, COMPUTER_DRIVER_RELEASE_TEST_ETAG),
  ])
  const result = await computerResolveDriverRelease({
    fetch: fake.fetch,
    policy: pinnedPolicy(COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION),
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND })
}

describe("falhas na resolução da release do driver", () => {
  test("recusa release sem asset do alvo", missingTargetAssetFails)
  test("recusa release sem fonte de checksum", missingChecksumSourceFails)
  test("recusa pinagem sem ref de tag", pinnedMissingTagFails)
  test("recusa pinagem cuja tag não tem release", pinnedTagWithoutReleaseFails)
  test("recusa latest-stable sem release publicada", unpublishedTagsFail)
  test("recusa pinagem de release draft", pinnedDraftFails)
})
