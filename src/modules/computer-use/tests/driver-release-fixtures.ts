import {
  COMPUTER_DRIVER_RELEASE_TAG_REF_PREFIX,
  type ComputerDriverReleaseAsset,
  type ComputerDriverReleaseRecord,
  computerDriverReleaseTagRefsUrl,
  computerDriverReleaseTagUrl,
} from "#synapse/modules/computer-use/adapters/driver-release"
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

export function computerReleaseTestTagRef(tag: string): string {
  return `${COMPUTER_DRIVER_RELEASE_TAG_REF_PREFIX}${tag}`
}

export function computerReleaseTestTagRefsBody(tags: string[]): string {
  return JSON.stringify(tags.map((tag) => ({ ref: computerReleaseTestTagRef(tag) })))
}

export function computerReleaseTestTagRefsRoute(
  apiUrl: string,
  tags: string[],
  etag?: string,
): ComputerReleaseTestRoute {
  const route: ComputerReleaseTestRoute = {
    url: computerDriverReleaseTagRefsUrl(apiUrl),
    status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
    body: computerReleaseTestTagRefsBody(tags),
  }
  if (etag) {
    route.etag = etag
  }
  return route
}

export function computerReleaseTestReleaseBody(release: ComputerDriverReleaseRecord): string {
  return JSON.stringify(release)
}

export function computerReleaseTestReleaseRoute(
  apiUrl: string,
  release: ComputerDriverReleaseRecord,
  etag?: string,
): ComputerReleaseTestRoute {
  const route: ComputerReleaseTestRoute = {
    url: computerDriverReleaseTagUrl(apiUrl, release.tag_name),
    status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
    body: computerReleaseTestReleaseBody(release),
  }
  if (etag) {
    route.etag = etag
  }
  return route
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
