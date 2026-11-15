import {
  type ComputerDriverChecksumSource,
  type ComputerDriverReleaseResult,
  type ComputerDriverReleaseSelection,
} from "#synapse/modules/computer-use/public/contracts"
import { computerReadDriverReleaseChecksum } from "./checksum-reading"
import { COMPUTER_DRIVER_RELEASE_FAILED, COMPUTER_DRIVER_RELEASE_RESOLVED } from "./constants"
import { type ComputerDriverReleasePagesRead, computerReadDriverReleasePages } from "./release-page-reading"
import {
  type ComputerDriverReleaseAssetSelected,
  type ComputerDriverReleaseSelected,
  computerSelectDriverRelease,
  computerSelectDriverReleaseAsset,
} from "./release-selection"
import { type ComputerDriverReleaseRequest } from "./types"

export async function computerResolveDriverRelease(
  request: ComputerDriverReleaseRequest,
): Promise<ComputerDriverReleaseResult> {
  const pages = await computerReadDriverReleasePages({
    fetch: request.fetch,
    releasesApiUrl: request.releasesApiUrl,
    cachedPages: request.cachedPages,
  })
  if (pages.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return pages
  }
  return computerResolveSelectedDriverRelease(request, pages)
}

async function computerResolveSelectedDriverRelease(
  request: ComputerDriverReleaseRequest,
  pages: ComputerDriverReleasePagesRead,
): Promise<ComputerDriverReleaseResult> {
  const release = computerSelectDriverRelease({ policy: request.policy, releases: pages.releases })
  if (release.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return release
  }
  const asset = computerSelectDriverReleaseAsset({
    platform: request.platform,
    architecture: request.architecture,
    version: release.version,
    assets: release.release.assets,
  })
  if (asset.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return asset
  }
  const checksum = await computerReadDriverReleaseChecksum({
    fetch: request.fetch,
    assetBaseUrl: request.assetBaseUrl,
    release: release.release,
    asset: asset.asset,
  })
  if (checksum.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return checksum
  }
  return {
    kind: COMPUTER_DRIVER_RELEASE_RESOLVED,
    selection: computerDriverReleaseSelection(request, release, asset, checksum.sha256, checksum.source),
    pages: pages.pages,
  }
}

function computerDriverReleaseSelection(
  request: ComputerDriverReleaseRequest,
  release: ComputerDriverReleaseSelected,
  asset: ComputerDriverReleaseAssetSelected,
  expectedSha256: string,
  checksumSource: ComputerDriverChecksumSource,
): ComputerDriverReleaseSelection {
  return {
    releaseId: release.release.id,
    tag: release.release.tag_name,
    version: release.version,
    platform: request.platform,
    architecture: request.architecture,
    assetName: asset.asset.name,
    assetUrl: `${request.assetBaseUrl}/${release.release.tag_name}/${asset.asset.name}`,
    expectedSha256,
    checksumSource,
  }
}
