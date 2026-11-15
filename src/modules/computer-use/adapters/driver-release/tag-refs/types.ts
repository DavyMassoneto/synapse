import {
  type ComputerDriverPolicy,
  type ComputerDriverReleaseCachedPage,
  type ComputerDriverReleaseFailed,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerDriverReleaseVersion } from "../release-selection"
import { type ComputerDriverReleaseFetch } from "../types"

export interface ComputerDriverReleaseTagRefsRequest {
  fetch: ComputerDriverReleaseFetch
  releasesApiUrl: string
  cachedPages: ComputerDriverReleaseCachedPage[]
}

export interface ComputerDriverReleaseTagRefsRead {
  kind: "release-tag-refs-read"
  refs: string[]
  pages: ComputerDriverReleaseCachedPage[]
}

export interface ComputerDriverReleaseTagRefsParsed {
  kind: "release-tag-refs-parsed"
  refs: string[]
}

export type ComputerDriverReleaseTagRefsResult = ComputerDriverReleaseTagRefsRead | ComputerDriverReleaseFailed

export type ComputerDriverReleaseTagRefsParsedResult = ComputerDriverReleaseTagRefsParsed | ComputerDriverReleaseFailed

export interface ComputerDriverReleaseTagSelectionRequest {
  policy: ComputerDriverPolicy
  refs: string[]
}

export interface ComputerDriverReleaseTagCandidate {
  tag: string
  version: ComputerDriverReleaseVersion
}

export interface ComputerDriverReleaseTagsSelected {
  kind: "release-tags-selected"
  version: string
  tags: string[]
}

export type ComputerDriverReleaseTagsResult = ComputerDriverReleaseTagsSelected | ComputerDriverReleaseFailed
