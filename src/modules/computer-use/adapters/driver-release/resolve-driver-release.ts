import {
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  type ComputerDriverChecksumSource,
  type ComputerDriverReleaseCachedPage,
  type ComputerDriverReleaseResult,
  type ComputerDriverReleaseSelection,
} from "#synapse/modules/computer-use/public/contracts"
import { computerReadDriverReleaseChecksum } from "./checksum-reading"
import {
  COMPUTER_DRIVER_RELEASE_CANDIDATE_SKIPPED,
  COMPUTER_DRIVER_RELEASE_FAILED,
  COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE,
  COMPUTER_DRIVER_RELEASE_RELEASE_DETAIL_ABSENT,
  COMPUTER_DRIVER_RELEASE_RESOLVED,
} from "./constants"
import {
  type ComputerDriverReleaseCandidateResult,
  type ComputerDriverReleaseDetailRead,
  computerReadDriverReleaseDetail,
} from "./release-detail"
import {
  COMPUTER_DRIVER_RELEASE_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_VERSION_ABSENT,
  type ComputerDriverReleaseAssetSelected,
  computerReadDriverReleaseVersion,
  computerSelectDriverReleaseAsset,
} from "./release-selection"
import {
  type ComputerDriverReleaseTagsSelected,
  computerReadDriverReleaseTagRefs,
  computerSelectDriverReleaseTags,
} from "./tag-refs"
import { type ComputerDriverReleaseRecord, type ComputerDriverReleaseRequest } from "./types"

export async function computerResolveDriverRelease(
  request: ComputerDriverReleaseRequest,
): Promise<ComputerDriverReleaseResult> {
  const refs = await computerReadDriverReleaseTagRefs({
    fetch: request.fetch,
    releasesApiUrl: request.releasesApiUrl,
    cachedPages: request.cachedPages,
  })
  if (refs.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return refs
  }
  const tags = computerSelectDriverReleaseTags({ policy: request.policy, refs: refs.refs })
  if (tags.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return tags
  }
  return computerResolveSelectedDriverRelease(request, tags, [...refs.pages])
}

async function computerResolveSelectedDriverRelease(
  request: ComputerDriverReleaseRequest,
  tags: ComputerDriverReleaseTagsSelected,
  pages: ComputerDriverReleaseCachedPage[],
): Promise<ComputerDriverReleaseResult> {
  for (const tag of tags.tags) {
    const candidate = await computerReadReleaseCandidate(request, tag, pages)
    if (candidate.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
      return candidate
    }
    if (candidate.kind === COMPUTER_DRIVER_RELEASE_CANDIDATE_SKIPPED) {
      continue
    }
    return computerResolveReleaseCandidate(request, tag, candidate, pages)
  }
  return computerDriverReleaseFailure(request)
}

async function computerReadReleaseCandidate(
  request: ComputerDriverReleaseRequest,
  tag: string,
  pages: ComputerDriverReleaseCachedPage[],
): Promise<ComputerDriverReleaseCandidateResult> {
  const detail = await computerReadDriverReleaseDetail({
    fetch: request.fetch,
    releasesApiUrl: request.releasesApiUrl,
    tag,
    cachedPages: request.cachedPages,
  })
  if (detail.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return detail
  }
  if (detail.kind === COMPUTER_DRIVER_RELEASE_RELEASE_DETAIL_ABSENT || detail.release.draft) {
    return { kind: COMPUTER_DRIVER_RELEASE_CANDIDATE_SKIPPED }
  }
  pages.push(...detail.pages)
  return detail
}

async function computerResolveReleaseCandidate(
  request: ComputerDriverReleaseRequest,
  tag: string,
  release: ComputerDriverReleaseDetailRead,
  pages: ComputerDriverReleaseCachedPage[],
): Promise<ComputerDriverReleaseResult> {
  const version = computerReadDriverReleaseVersion(tag)
  if (version.kind === COMPUTER_DRIVER_RELEASE_VERSION_ABSENT) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
  }
  const asset = computerSelectDriverReleaseAsset({
    platform: request.platform,
    architecture: request.architecture,
    version: version.version.text,
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
    selection: computerDriverReleaseSelection(
      request,
      version.version.text,
      release.release,
      asset,
      checksum.sha256,
      checksum.source,
    ),
    pages,
  }
}

function computerDriverReleaseFailure(request: ComputerDriverReleaseRequest): ComputerDriverReleaseResult {
  const message =
    request.policy.mode === COMPUTER_DRIVER_POLICY_MODE_PINNED
      ? COMPUTER_DRIVER_RELEASE_PINNED_NOT_FOUND
      : COMPUTER_DRIVER_RELEASE_NOT_FOUND
  return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message }
}

function computerDriverReleaseSelection(
  request: ComputerDriverReleaseRequest,
  version: string,
  release: ComputerDriverReleaseRecord,
  asset: ComputerDriverReleaseAssetSelected,
  expectedSha256: string,
  checksumSource: ComputerDriverChecksumSource,
): ComputerDriverReleaseSelection {
  return {
    releaseId: release.id,
    tag: release.tag_name,
    version,
    platform: request.platform,
    architecture: request.architecture,
    assetName: asset.asset.name,
    assetUrl: `${request.assetBaseUrl}/${release.tag_name}/${asset.asset.name}`,
    expectedSha256,
    checksumSource,
  }
}
