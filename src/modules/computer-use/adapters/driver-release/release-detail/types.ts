import {
  type ComputerDriverReleaseCachedPage,
  type ComputerDriverReleaseFailed,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerDriverReleaseFetch, type ComputerDriverReleaseRecord } from "../types"

export interface ComputerDriverReleaseDetailRequest {
  fetch: ComputerDriverReleaseFetch
  releasesApiUrl: string
  tag: string
  cachedPages: ComputerDriverReleaseCachedPage[]
}

export interface ComputerDriverReleaseDetailRead {
  kind: "release-detail-read"
  release: ComputerDriverReleaseRecord
  pages: ComputerDriverReleaseCachedPage[]
}

export interface ComputerDriverReleaseDetailAbsent {
  kind: "release-detail-absent"
}

export interface ComputerDriverReleaseDetailParsed {
  kind: "release-detail-parsed"
  release: ComputerDriverReleaseRecord
}

export type ComputerDriverReleaseDetailResult =
  | ComputerDriverReleaseDetailRead
  | ComputerDriverReleaseDetailAbsent
  | ComputerDriverReleaseFailed

export type ComputerDriverReleaseDetailParsedResult = ComputerDriverReleaseDetailParsed | ComputerDriverReleaseFailed

export interface ComputerDriverReleaseCandidateSkipped {
  kind: "release-candidate-skipped"
}

export type ComputerDriverReleaseCandidateResult =
  | ComputerDriverReleaseDetailRead
  | ComputerDriverReleaseFailed
  | ComputerDriverReleaseCandidateSkipped
