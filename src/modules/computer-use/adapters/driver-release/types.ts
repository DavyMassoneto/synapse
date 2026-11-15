import { type Static } from "typebox"
import {
  type ComputerDriverPolicy,
  type ComputerDriverReleaseCachedPage,
  type ComputerDriverReleaseFailed,
  type ComputerPlatform,
} from "#synapse/modules/computer-use/public/contracts"
import {
  type COMPUTER_DRIVER_RELEASE_ASSET_SCHEMA,
  type COMPUTER_DRIVER_RELEASE_MANIFEST_SCHEMA,
  type COMPUTER_DRIVER_RELEASE_SCHEMA,
  type COMPUTER_DRIVER_RELEASE_TAG_REF_SCHEMA,
} from "./schemas"

export type ComputerDriverReleaseAsset = Static<typeof COMPUTER_DRIVER_RELEASE_ASSET_SCHEMA>

export type ComputerDriverReleaseRecord = Static<typeof COMPUTER_DRIVER_RELEASE_SCHEMA>

export type ComputerDriverReleaseTagRef = Static<typeof COMPUTER_DRIVER_RELEASE_TAG_REF_SCHEMA>

export type ComputerDriverReleaseManifest = Static<typeof COMPUTER_DRIVER_RELEASE_MANIFEST_SCHEMA>

export type ComputerDriverReleaseFetch = (url: string, init: RequestInit) => Promise<Response>

export interface ComputerDriverReleaseRequest {
  policy: ComputerDriverPolicy
  platform: ComputerPlatform
  architecture: string
  releasesApiUrl: string
  assetBaseUrl: string
  cachedPages: ComputerDriverReleaseCachedPage[]
  fetch: ComputerDriverReleaseFetch
}

export interface ComputerDriverReleaseResponseRequest {
  fetch: ComputerDriverReleaseFetch
  url: string
  headers: Headers
}

export interface ComputerDriverReleaseResponseReceived {
  kind: "release-response"
  response: Response
}

export type ComputerDriverReleaseResponseResult = ComputerDriverReleaseResponseReceived | ComputerDriverReleaseFailed

export interface ComputerDriverReleaseTextRequest {
  fetch: ComputerDriverReleaseFetch
  url: string
  headers: Headers
  maxBytes: number
}

export interface ComputerDriverReleaseTextRead {
  kind: "release-text-read"
  text: string
}

export type ComputerDriverReleaseTextResult = ComputerDriverReleaseTextRead | ComputerDriverReleaseFailed

export interface ComputerDriverReleaseCachedJsonRequest {
  fetch: ComputerDriverReleaseFetch
  url: string
  cachedPages: ComputerDriverReleaseCachedPage[]
  maxBytes: number
  absentWhenNotFound: boolean
}

export interface ComputerDriverReleaseCachedJsonRead {
  kind: "release-json-read"
  text: string
  etag?: string
}

export interface ComputerDriverReleaseCachedJsonAbsent {
  kind: "release-json-absent"
}

export type ComputerDriverReleaseCachedJsonResult =
  | ComputerDriverReleaseCachedJsonRead
  | ComputerDriverReleaseCachedJsonAbsent
  | ComputerDriverReleaseFailed
