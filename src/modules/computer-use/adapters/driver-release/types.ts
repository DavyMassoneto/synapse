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
  type COMPUTER_DRIVER_RELEASE_PAGE_SCHEMA,
  type COMPUTER_DRIVER_RELEASE_SCHEMA,
} from "./schemas"

export type ComputerDriverReleaseAsset = Static<typeof COMPUTER_DRIVER_RELEASE_ASSET_SCHEMA>

export type ComputerDriverReleaseRecord = Static<typeof COMPUTER_DRIVER_RELEASE_SCHEMA>

export type ComputerDriverReleasePage = Static<typeof COMPUTER_DRIVER_RELEASE_PAGE_SCHEMA>

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
