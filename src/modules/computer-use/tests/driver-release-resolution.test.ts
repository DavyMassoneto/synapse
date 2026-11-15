import { describe, expect, test } from "vitest"
import { computerResolveDriverRelease } from "#synapse/modules/computer-use/adapters/driver-release"
import { COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS as CHECKSUM_ASSET } from "#synapse/modules/computer-use/adapters/driver-release/checksum-reading"
import { COMPUTER_DRIVER_RELEASE_ARCHITECTURE_X64 } from "#synapse/modules/computer-use/adapters/driver-release/release-selection"
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
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_RELEASE_ID,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_VERSION,
  COMPUTER_DRIVER_RELEASE_TEST_REASON,
  COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
  COMPUTER_DRIVER_RELEASE_TEST_SHA256,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_UNPUBLISHED_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_VERSION,
} from "./driver-release-constants"
import {
  computerReleaseTestAsset,
  computerReleaseTestChecksumLine,
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

function checksumRoute(tag: string, assetName: string): ComputerReleaseTestRoute {
  return {
    url: `${COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL}/${tag}/${CHECKSUM_ASSET}`,
    status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
    body: computerReleaseTestChecksumLine(COMPUTER_DRIVER_RELEASE_TEST_SHA256, assetName),
  }
}

function missingReleaseRoute(apiUrl: string, tag: string): ComputerReleaseTestRoute {
  return {
    url: `${apiUrl}/tags/${tag}`,
    status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_FOUND,
    body: "",
  }
}

async function latestPublishedReleaseIsSelected(): Promise<void> {
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [
      computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null),
      computerReleaseTestAsset(CHECKSUM_ASSET, null),
    ],
    false,
    true,
  )
  const refsRoute = computerReleaseTestTagRefsRoute(
    COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    [COMPUTER_DRIVER_RELEASE_TEST_UNPUBLISHED_TAG, COMPUTER_DRIVER_RELEASE_TEST_TAG],
    COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  )
  const detailRoute = computerReleaseTestReleaseRoute(
    COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    release,
    COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  )
  const fake = new ComputerFakeReleaseHttp([
    refsRoute,
    missingReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, COMPUTER_DRIVER_RELEASE_TEST_UNPUBLISHED_TAG),
    detailRoute,
    checksumRoute(COMPUTER_DRIVER_RELEASE_TEST_TAG, COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME),
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
      { url: refsRoute.url, etag: COMPUTER_DRIVER_RELEASE_TEST_ETAG, body: refsRoute.body },
      { url: detailRoute.url, etag: COMPUTER_DRIVER_RELEASE_TEST_ETAG, body: detailRoute.body },
    ],
  })
  expect(fake.requests).toHaveLength(4)
}

async function pinnedReleaseIsSelected(): Promise<void> {
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_OLDER_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
    [
      computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME, null),
      computerReleaseTestAsset(CHECKSUM_ASSET, null),
    ],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestTagRefsRoute(
      COMPUTER_DRIVER_RELEASE_TEST_API_URL,
      [COMPUTER_DRIVER_RELEASE_TEST_TAG, COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG],
      COMPUTER_DRIVER_RELEASE_TEST_ETAG,
    ),
    computerReleaseTestReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, release, COMPUTER_DRIVER_RELEASE_TEST_ETAG),
    checksumRoute(COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG, COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME),
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

async function draftReleaseSkipped(): Promise<void> {
  const draft = computerReleaseTestRelease(1, "cua-driver-rs-v0.52.0", [], true, false)
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [
      computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null),
      computerReleaseTestAsset(CHECKSUM_ASSET, null),
    ],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    computerReleaseTestTagRefsRoute(
      COMPUTER_DRIVER_RELEASE_TEST_API_URL,
      ["cua-driver-rs-v0.52.0", COMPUTER_DRIVER_RELEASE_TEST_TAG],
      COMPUTER_DRIVER_RELEASE_TEST_ETAG,
    ),
    computerReleaseTestReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, draft, COMPUTER_DRIVER_RELEASE_TEST_ETAG),
    computerReleaseTestReleaseRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, release, COMPUTER_DRIVER_RELEASE_TEST_ETAG),
    checksumRoute(COMPUTER_DRIVER_RELEASE_TEST_TAG, COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME),
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
  expect(result).toMatchObject({
    kind: "release-resolved",
    selection: { version: COMPUTER_DRIVER_RELEASE_TEST_VERSION },
  })
}

describe("resolução da release do driver", () => {
  test("resolve latest-stable pulando tags sem release publicada", latestPublishedReleaseIsSelected)
  test("resolve a versão exata de uma pinagem", pinnedReleaseIsSelected)
  test("ignora release draft", draftReleaseSkipped)
})
