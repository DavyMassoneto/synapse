import {
  COMPUTER_DRIVER_CHECKSUM_SOURCE_ASSET_DIGEST,
  COMPUTER_DRIVER_CHECKSUM_SOURCE_CHECKSUMS_TEXT,
  COMPUTER_DRIVER_CHECKSUM_SOURCE_RELEASE_MANIFEST,
  COMPUTER_DRIVER_CHECKSUM_SOURCE_SHA256SUMS,
  type ComputerDriverChecksumSource,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import { computerReadDriverReleaseText } from "../read-release-response"
import { type ComputerDriverReleaseAsset } from "../types"
import {
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_CHECKSUMS_TEXT,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_RELEASE_MANIFEST,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_DIVERGENT,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_FOUND,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING,
  COMPUTER_DRIVER_RELEASE_MAX_CHECKSUM_BYTES,
} from "./constants"
import { computerParseDriverReleaseAssetDigest } from "./parse-asset-digest"
import { computerParseDriverReleaseChecksumsText } from "./parse-checksums-text"
import { computerParseDriverReleaseManifest } from "./parse-release-manifest"
import { computerParseDriverReleaseSha256Sums } from "./parse-sha256-sums"
import {
  type ComputerDriverReleaseChecksumFile,
  type ComputerDriverReleaseChecksumRequest,
  type ComputerDriverReleaseChecksumResult,
} from "./types"

export async function computerReadDriverReleaseChecksum(
  request: ComputerDriverReleaseChecksumRequest,
): Promise<ComputerDriverReleaseChecksumResult> {
  for (const file of computerChecksumFiles()) {
    const published = request.release.assets.find((entry) => entry.name === file.assetName)
    if (!published) {
      continue
    }
    return computerReadChecksumFile(request, file)
  }
  return computerChecksumFromAssetDigest(request.asset)
}

function computerChecksumFiles(): ComputerDriverReleaseChecksumFile[] {
  return [
    {
      assetName: COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_SHA256SUMS,
      source: COMPUTER_DRIVER_CHECKSUM_SOURCE_SHA256SUMS,
      parse: computerParseDriverReleaseSha256Sums,
    },
    {
      assetName: COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_CHECKSUMS_TEXT,
      source: COMPUTER_DRIVER_CHECKSUM_SOURCE_CHECKSUMS_TEXT,
      parse: computerParseDriverReleaseChecksumsText,
    },
    {
      assetName: COMPUTER_DRIVER_RELEASE_CHECKSUM_ASSET_RELEASE_MANIFEST,
      source: COMPUTER_DRIVER_CHECKSUM_SOURCE_RELEASE_MANIFEST,
      parse: computerParseDriverReleaseManifest,
    },
  ]
}

async function computerReadChecksumFile(
  request: ComputerDriverReleaseChecksumRequest,
  file: ComputerDriverReleaseChecksumFile,
): Promise<ComputerDriverReleaseChecksumResult> {
  const read = await computerReadDriverReleaseText({
    fetch: request.fetch,
    url: `${request.assetBaseUrl}/${request.release.tag_name}/${file.assetName}`,
    headers: new Headers(),
    maxBytes: COMPUTER_DRIVER_RELEASE_MAX_CHECKSUM_BYTES,
  })
  if (read.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return read
  }
  const parsed = file.parse(read.text, request.asset.name)
  if (parsed.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return parsed
  }
  return computerChecksumVerifyingDigest(request.asset, parsed.sha256, file.source)
}

function computerChecksumVerifyingDigest(
  asset: ComputerDriverReleaseAsset,
  sha256: string,
  source: ComputerDriverChecksumSource,
): ComputerDriverReleaseChecksumResult {
  const digest = asset.digest
  if (!digest) {
    return { kind: COMPUTER_DRIVER_RELEASE_CHECKSUM_FOUND, sha256, source }
  }
  const parsed = computerParseDriverReleaseAssetDigest(digest)
  if (parsed.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return parsed
  }
  if (parsed.sha256 !== sha256) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_DIVERGENT }
  }
  return { kind: COMPUTER_DRIVER_RELEASE_CHECKSUM_FOUND, sha256, source }
}

function computerChecksumFromAssetDigest(asset: ComputerDriverReleaseAsset): ComputerDriverReleaseChecksumResult {
  const digest = asset.digest
  if (!digest) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MISSING }
  }
  const parsed = computerParseDriverReleaseAssetDigest(digest)
  if (parsed.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return parsed
  }
  return {
    kind: COMPUTER_DRIVER_RELEASE_CHECKSUM_FOUND,
    sha256: parsed.sha256,
    source: COMPUTER_DRIVER_CHECKSUM_SOURCE_ASSET_DIGEST,
  }
}
