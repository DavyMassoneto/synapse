import { describe, expect, test } from "vitest"
import { computerResolveDriverRelease } from "#synapse/modules/computer-use/adapters/driver-release"
import {
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING,
} from "#synapse/modules/computer-use/adapters/driver-release/checksum-reading"
import {
  COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
  COMPUTER_DRIVER_RELEASE_ASSET_MISSING,
} from "#synapse/modules/computer-use/adapters/driver-release/release-selection"
import {
  COMPUTER_DRIVER_CHECKSUM_SOURCE_SHA256SUMS,
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
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION,
  COMPUTER_DRIVER_RELEASE_TEST_REASON,
  COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
  COMPUTER_DRIVER_RELEASE_TEST_SHA256,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_VERSION,
} from "./driver-release-constants"
import {
  computerReleaseTestAsset,
  computerReleaseTestChecksumLine,
  computerReleaseTestOlderRelease,
  computerReleaseTestPageRoute,
  computerReleaseTestRelease,
  computerReleaseTestStableRelease,
} from "./driver-release-fixtures"
import { ComputerFakeReleaseHttp } from "./driver-release-support"

function latestPolicy(): ComputerDriverPolicy {
  return { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE }
}

function pinnedPolicy(version: string): ComputerDriverPolicy {
  return { mode: COMPUTER_DRIVER_POLICY_MODE_PINNED, version, reason: COMPUTER_DRIVER_RELEASE_TEST_REASON }
}

async function latestStableResolved(): Promise<void> {
  const target = computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [target, computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS, null)],
    false,
    false,
  )
  const pageRoute = computerReleaseTestPageRoute(
    COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    1,
    [release],
    COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  )
  const fake = new ComputerFakeReleaseHttp([
    pageRoute,
    {
      url: `${COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL}/${COMPUTER_DRIVER_RELEASE_TEST_TAG}/${COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS}`,
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: computerReleaseTestChecksumLine(
        COMPUTER_DRIVER_RELEASE_TEST_SHA256,
        COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
      ),
    },
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
    kind: "release-resolved",
    selection: {
      releaseId: COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
      tag: COMPUTER_DRIVER_RELEASE_TEST_TAG,
      version: COMPUTER_DRIVER_RELEASE_TEST_VERSION,
      platform: COMPUTER_LINUX,
      architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
      assetName: COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
      assetUrl: `${COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL}/${COMPUTER_DRIVER_RELEASE_TEST_TAG}/${COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME}`,
      expectedSha256: COMPUTER_DRIVER_RELEASE_TEST_SHA256,
      checksumSource: COMPUTER_DRIVER_CHECKSUM_SOURCE_SHA256SUMS,
    },
    pages: [
      {
        url: pageRoute.url,
        etag: COMPUTER_DRIVER_RELEASE_TEST_ETAG,
        body: pageRoute.body,
      },
    ],
  })
}

async function pinnedResolved(): Promise<void> {
  const target = computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME, null)
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
    [target, computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS, null)],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestPageRoute(
      COMPUTER_DRIVER_RELEASE_TEST_API_URL,
      1,
      [computerReleaseTestStableRelease(), release],
      COMPUTER_DRIVER_RELEASE_TEST_ETAG,
    ),
    {
      url: `${COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL}/${COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG}/${COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS}`,
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: computerReleaseTestChecksumLine(
        COMPUTER_DRIVER_RELEASE_TEST_SHA256,
        COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME,
      ),
    },
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
  expect(result).toMatchObject({
    kind: "release-resolved",
    selection: {
      tag: COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
      version: COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION,
      assetName: COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME,
    },
  })
}

async function missingTargetAssetFails(): Promise<void> {
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS, null)],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestPageRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 1, [release], COMPUTER_DRIVER_RELEASE_TEST_ETAG),
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
  const result = await computerResolveDriverRelease({
    fetch: new ComputerFakeReleaseHttp([
      computerReleaseTestPageRoute(
        COMPUTER_DRIVER_RELEASE_TEST_API_URL,
        1,
        [computerReleaseTestStableRelease(), computerReleaseTestOlderRelease()],
        COMPUTER_DRIVER_RELEASE_TEST_ETAG,
      ),
    ]).fetch,
    policy: pinnedPolicy(COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION),
    platform: COMPUTER_LINUX,
    architecture: COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING })
}

describe("resolução da release do driver", () => {
  test("resolve latest-stable com checksum e página revalidável", latestStableResolved)
  test("resolve a versão exata de uma pinagem", pinnedResolved)
  test("recusa release sem asset do alvo", missingTargetAssetFails)
  test("recusa release sem fonte de checksum", missingChecksumSourceFails)
})
