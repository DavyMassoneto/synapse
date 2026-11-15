import { describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_DIVERGENT,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED,
  computerReadDriverReleaseChecksum,
} from "#synapse/modules/computer-use/adapters/driver-release/checksum-reading"
import {
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
  COMPUTER_DRIVER_RELEASE_TEST_OTHER_SHA256,
  COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
  COMPUTER_DRIVER_RELEASE_TEST_SHA256,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
} from "./driver-release-constants"
import {
  computerReleaseTestAsset,
  computerReleaseTestChecksumLine,
  computerReleaseTestRelease,
} from "./driver-release-fixtures"
import { ComputerFakeReleaseHttp } from "./driver-release-support"

function checksumUrl(assetName: string): string {
  return `${COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL}/${COMPUTER_DRIVER_RELEASE_TEST_TAG}/${assetName}`
}

async function malformedChecksumFails(): Promise<void> {
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
      body: "checksum-inválido\n",
    },
  ])
  const result = await computerReadDriverReleaseChecksum({
    fetch: fake.fetch,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    release,
    asset: target,
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED })
}

async function duplicateChecksumFails(): Promise<void> {
  const target = computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)
  const release = computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [target, computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS, null)],
    false,
    false,
  )
  const entry = { name: COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, sha256: COMPUTER_DRIVER_RELEASE_TEST_SHA256 }
  const fake = new ComputerFakeReleaseHttp([
    {
      url: checksumUrl(COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: `${computerReleaseTestChecksumLine(entry.sha256, entry.name)}${computerReleaseTestChecksumLine(entry.sha256, entry.name)}`,
    },
  ])
  const result = await computerReadDriverReleaseChecksum({
    fetch: fake.fetch,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    release,
    asset: target,
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED })
}

async function missingChecksumEntryFails(): Promise<void> {
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
        COMPUTER_DRIVER_RELEASE_TEST_OTHER_SHA256,
        "cua-driver-rs-0.51.0-darwin-universal.tar.gz",
      ),
    },
  ])
  const result = await computerReadDriverReleaseChecksum({
    fetch: fake.fetch,
    assetBaseUrl: COMPUTER_DRIVER_RELEASE_TEST_ASSET_BASE_URL,
    release,
    asset: target,
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED })
}

async function divergentDigestFails(): Promise<void> {
  const target = computerReleaseTestAsset(
    COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
    `sha256:${COMPUTER_DRIVER_RELEASE_TEST_OTHER_SHA256}`,
  )
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
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_CHECKSUM_DIVERGENT })
}

async function malformedDigestFails(): Promise<void> {
  const target = computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, "md5:abc")
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
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED })
}

describe("checksum inválido da release do driver", () => {
  test("recusa checksum malformado", malformedChecksumFails)
  test("recusa entrada duplicada", duplicateChecksumFails)
  test("recusa checksum sem entrada do pacote", missingChecksumEntryFails)
  test("recusa digest da API divergente do checksum publicado", divergentDigestFails)
  test("recusa digest da API malformado", malformedDigestFails)
})
