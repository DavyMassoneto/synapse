import {
  type ComputerDriverReleaseAsset,
  type ComputerDriverReleaseRecord,
} from "#synapse/modules/computer-use/adapters/driver-release"
import { COMPUTER_DRIVER_RELEASE_PER_PAGE } from "#synapse/modules/computer-use/adapters/driver-release/release-page-reading"
import {
  COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_RELEASE_ID,
  COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
  COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
} from "./driver-release-constants"
import {
  type ComputerReleaseTestChecksumEntry,
  type ComputerReleaseTestDigest,
  type ComputerReleaseTestRoute,
} from "./driver-release-types"

export function computerReleaseTestAsset(name: string, digest: ComputerReleaseTestDigest): ComputerDriverReleaseAsset {
  return { name, digest }
}

export function computerReleaseTestRelease(
  id: number,
  tag: string,
  assets: ComputerDriverReleaseAsset[],
  draft: boolean,
  prerelease: boolean,
): ComputerDriverReleaseRecord {
  return { id, tag_name: tag, draft, prerelease, assets }
}

export function computerReleaseTestPageUrl(apiUrl: string, page: number): string {
  const url = new URL(apiUrl)
  url.searchParams.set("per_page", `${COMPUTER_DRIVER_RELEASE_PER_PAGE}`)
  url.searchParams.set("page", `${page}`)
  return url.toString()
}

export function computerReleaseTestPage(releases: ComputerDriverReleaseRecord[]): string {
  return JSON.stringify(releases)
}

export function computerReleaseTestPageRoute(
  apiUrl: string,
  page: number,
  releases: ComputerDriverReleaseRecord[],
  etag: string,
): ComputerReleaseTestRoute {
  return {
    url: computerReleaseTestPageUrl(apiUrl, page),
    status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
    body: computerReleaseTestPage(releases),
    etag,
  }
}

export function computerReleaseTestOlderRelease(): ComputerDriverReleaseRecord {
  return computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_OLDER_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_OLDER_TAG,
    [computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_OLDER_ASSET_NAME, null)],
    false,
    false,
  )
}

export function computerReleaseTestStableRelease(): ComputerDriverReleaseRecord {
  return computerReleaseTestRelease(
    COMPUTER_DRIVER_RELEASE_TEST_RELEASE_ID,
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
    [computerReleaseTestAsset(COMPUTER_DRIVER_RELEASE_TEST_ASSET_NAME, null)],
    false,
    false,
  )
}

export function computerReleaseTestOtherRelease(id: number, tag: string): ComputerDriverReleaseRecord {
  return computerReleaseTestRelease(id, tag, [], false, false)
}

export function computerReleaseTestManyReleases(count: number, prefix: string): ComputerDriverReleaseRecord[] {
  return Array.from({ length: count }, (_, index) =>
    computerReleaseTestOtherRelease(index + 1, `${prefix}${index + 1}`),
  )
}

export function computerReleaseTestChecksumLine(sha256: string, name: string): string {
  return `${sha256}  ${name}\n`
}

export function computerReleaseTestChecksumsText(entries: ComputerReleaseTestChecksumEntry[]): string {
  const lines = entries.map((entry) => computerReleaseTestChecksumLine(entry.sha256, entry.name))
  return `## SHA256 Checksums\n\n\`\`\`\n${lines.join("")}\`\`\`\n`
}

export function computerReleaseTestManifest(entries: ComputerReleaseTestChecksumEntry[]): string {
  return JSON.stringify({ assets: entries })
}
