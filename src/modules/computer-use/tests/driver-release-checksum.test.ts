import { describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_CHECKSUMS_TEXT,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_RELEASE_MANIFEST,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING,
  computerReadDriverReleaseChecksum,
} from "#synapse/modules/computer-use/adapters/driver-release/checksum-reading"
import {
  COMPUTER_DRIVER_CHECKSUM_SOURCE_ASSET_DIGEST,
  COMPUTER_DRIVER_CHECKSUM_SOURCE_CHECKSUMS_TEXT,
  COMPUTER_DRIVER_CHECKSUM_SOURCE_RELEASE_MANIFEST,
  COMPUTER_DRIVER_CHECKSUM_SOURCE_SHA256SUMS,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
  COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
  COMPUTER_DRIVER_RELEASE_TEST_SHA256,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
} from "./driver-release-constants"
import {
  computerReleaseTestAsset,
  computerReleaseTestChecksumLine,
  computerReleaseTestChecksumsText,
  computerReleaseTestManifest,
  computerReleaseTestRelease,
} from "./driver-release-fixtures"
import { ComputerFakeReleaseHttp } from "./driver-release-support"

function checksumUrl(assetName: string): string {
  return `${COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL}/${COMPUTER_DRIVER_RELEASE_TEST_TAG}/${assetName}`
}

async function sha256SumsSelected(): Promise<void> {
  const target = computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [target, computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS, null)],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    {
      url: checksumUrl(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: computerReleaseTestChecksumLine(
        COMPUTER_DRIVER_RELEASE_TEST_SHA256,
        COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
      ),
    },
  ])
  const result = await computerReadDriverReleaseChecksum({
    fetch: fake.fetch,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    release,
    asset: target,
  })
  expect(result).toStrictEqual({
    kind: "checksum-found",
    sha256: COMPUTER_DRIVER_RELEASE_TEST_SHA256,
    source: COMPUTER_DRIVER_CHECKSUM_SOURCE_SHA256SUMS,
  })
}

async function checksumsTextFallbackSelected(): Promise<void> {
  const target = computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [target, computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_CHECKSUMS_TEXT, null)],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    {
      url: checksumUrl(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_CHECKSUMS_TEXT),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: computerReleaseTestChecksumsText([
        { name: COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, sha256: COMPUTER_DRIVER_RELEASE_TEST_SHA256 },
      ]),
    },
  ])
  const result = await computerReadDriverReleaseChecksum({
    fetch: fake.fetch,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    release,
    asset: target,
  })
  expect(result).toStrictEqual({
    kind: "checksum-found",
    sha256: COMPUTER_DRIVER_RELEASE_TEST_SHA256,
    source: COMPUTER_DRIVER_CHECKSUM_SOURCE_CHECKSUMS_TEXT,
  })
}

async function releaseManifestFallbackSelected(): Promise<void> {
  const target = computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [target, computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_RELEASE_MANIFEST, null)],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([
    {
      url: checksumUrl(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_RELEASE_MANIFEST),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: computerReleaseTestManifest([
        { name: COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, sha256: COMPUTER_DRIVER_RELEASE_TEST_SHA256 },
      ]),
    },
  ])
  const result = await computerReadDriverReleaseChecksum({
    fetch: fake.fetch,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    release,
    asset: target,
  })
  expect(result).toStrictEqual({
    kind: "checksum-found",
    sha256: COMPUTER_DRIVER_RELEASE_TEST_SHA256,
    source: COMPUTER_DRIVER_CHECKSUM_SOURCE_RELEASE_MANIFEST,
  })
}

async function assetDigestFallbackSelected(): Promise<void> {
  const target = computerReleaseTestAsset(
    COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
    `sha256:${COMPUTER_DRIVER_RELEASE_TEST_SHA256}`,
  )
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [target],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([])
  const result = await computerReadDriverReleaseChecksum({
    fetch: fake.fetch,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    release,
    asset: target,
  })
  expect(result).toStrictEqual({
    kind: "checksum-found",
    sha256: COMPUTER_DRIVER_RELEASE_TEST_SHA256,
    source: COMPUTER_DRIVER_CHECKSUM_SOURCE_ASSET_DIGEST,
  })
}

async function missingChecksumFails(): Promise<void> {
  const target = computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [target],
    false,
    false,
  )
  const fake = new ComputerFakeReleaseHttp([])
  const result = await computerReadDriverReleaseChecksum({
    fetch: fake.fetch,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    release,
    asset: target,
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING })
}

describe("checksum da release do driver", () => {
  test("usa SHA256SUMS publicado", sha256SumsSelected)
  test("usa checksums.txt quando não há SHA256SUMS", checksumsTextFallbackSelected)
  test("usa release-manifest.json quando não há checksums", releaseManifestFallbackSelected)
  test("usa digest sha256 do asset como fonte mínima", assetDigestFallbackSelected)
  test("recusa release sem fonte de checksum", missingChecksumFails)
})
