import {
  type ComputerDriverPolicy,
  type ComputerDriverReleaseFailed,
  type ComputerPlatform,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerDriverReleaseAsset, type ComputerDriverReleaseRecord } from "../types"

export interface ComputerDriverReleaseArchitectureSuffixes {
  arm64: string
  x64: string
}

export interface ComputerDriverReleasePlatformSuffixes {
  darwin: ComputerDriverReleaseArchitectureSuffixes
  linux: ComputerDriverReleaseArchitectureSuffixes
  win32: ComputerDriverReleaseArchitectureSuffixes
}

export interface ComputerDriverReleaseVersion {
  major: number
  minor: number
  patch: number
  text: string
}

export interface ComputerDriverReleaseVersionFound {
  kind: "release-version-found"
  version: ComputerDriverReleaseVersion
}

export interface ComputerDriverReleaseVersionAbsent {
  kind: "release-version-absent"
}

export type ComputerDriverReleaseVersionResult = ComputerDriverReleaseVersionFound | ComputerDriverReleaseVersionAbsent

export interface ComputerDriverReleaseCandidate {
  release: ComputerDriverReleaseRecord
  version: ComputerDriverReleaseVersion
}

export interface ComputerDriverReleaseSelectionRequest {
  policy: ComputerDriverPolicy
  releases: ComputerDriverReleaseRecord[]
}

export interface ComputerDriverReleaseSelected {
  kind: "release-selected"
  release: ComputerDriverReleaseRecord
  version: string
}

export type ComputerDriverReleaseSelectionResult = ComputerDriverReleaseSelected | ComputerDriverReleaseFailed

export interface ComputerDriverReleaseAssetRequest {
  platform: ComputerPlatform
  architecture: string
  version: string
  assets: ComputerDriverReleaseAsset[]
}

export interface ComputerDriverReleaseAssetSelected {
  kind: "asset-selected"
  asset: ComputerDriverReleaseAsset
}

export type ComputerDriverReleaseAssetResult = ComputerDriverReleaseAssetSelected | ComputerDriverReleaseFailed
