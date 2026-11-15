import {
  type ComputerDriverReleaseCachedPage,
  type ComputerDriverReleaseFailed,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerDriverReleaseFetch, type ComputerDriverReleaseRecord } from "../types"

export interface ComputerDriverReleasePageRequest {
  fetch: ComputerDriverReleaseFetch
  url: string
  cached?: ComputerDriverReleaseCachedPage
}

export interface ComputerDriverReleasePagesRequest {
  fetch: ComputerDriverReleaseFetch
  releasesApiUrl: string
  cachedPages: ComputerDriverReleaseCachedPage[]
}

export interface ComputerDriverReleasePageRead {
  kind: "release-page-read"
  releases: ComputerDriverReleaseRecord[]
  body: string
  etag?: string
}

export interface ComputerDriverReleasePagesRead {
  kind: "release-pages-read"
  releases: ComputerDriverReleaseRecord[]
  pages: ComputerDriverReleaseCachedPage[]
}

export interface ComputerDriverReleasePageParsed {
  kind: "release-page-parsed"
  releases: ComputerDriverReleaseRecord[]
}

export type ComputerDriverReleasePageReadResult = ComputerDriverReleasePageRead | ComputerDriverReleaseFailed

export type ComputerDriverReleasePagesResult = ComputerDriverReleasePagesRead | ComputerDriverReleaseFailed

export type ComputerDriverReleasePageParsedResult = ComputerDriverReleasePageParsed | ComputerDriverReleaseFailed
