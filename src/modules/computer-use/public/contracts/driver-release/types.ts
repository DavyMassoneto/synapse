import { type Static } from "typebox"
import { type ComputerPlatform } from "../actions"
import { type COMPUTER_DRIVER_POLICY_SCHEMA } from "./schemas"

export type ComputerDriverPolicy = Static<typeof COMPUTER_DRIVER_POLICY_SCHEMA>

export type ComputerDriverChecksumSource = "sha256sums" | "checksums-text" | "release-manifest" | "github-asset-digest"

export interface ComputerDriverReleaseCachedPage {
  url: string
  etag: string
  body: string
}

export interface ComputerDriverReleaseSelection {
  releaseId: number
  tag: string
  version: string
  platform: ComputerPlatform
  architecture: string
  assetName: string
  assetUrl: string
  expectedSha256: string
  checksumSource: ComputerDriverChecksumSource
}

export interface ComputerDriverReleaseResolved {
  kind: "release-resolved"
  selection: ComputerDriverReleaseSelection
  pages: ComputerDriverReleaseCachedPage[]
}

export interface ComputerDriverReleaseFailed {
  kind: "release-failed"
  message: string
}

export type ComputerDriverReleaseResult = ComputerDriverReleaseResolved | ComputerDriverReleaseFailed
