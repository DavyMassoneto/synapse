import {
  type ComputerDriverChecksumSource,
  type ComputerDriverReleaseFailed,
} from "#synapse/modules/computer-use/public/contracts"
import {
  type ComputerDriverReleaseAsset,
  type ComputerDriverReleaseFetch,
  type ComputerDriverReleaseRecord,
} from "../types"

export interface ComputerDriverReleaseChecksumRequest {
  fetch: ComputerDriverReleaseFetch
  assetBaseUrl: string
  release: ComputerDriverReleaseRecord
  asset: ComputerDriverReleaseAsset
}

export interface ComputerDriverReleaseChecksumFound {
  kind: "checksum-found"
  sha256: string
  source: ComputerDriverChecksumSource
}

export interface ComputerDriverReleaseChecksumParsed {
  kind: "checksum-parsed"
  sha256: string
}

export interface ComputerDriverReleaseChecksumEntry {
  name: string
  sha256: string
}

export interface ComputerDriverReleaseChecksumFile {
  assetName: string
  source: ComputerDriverChecksumSource
  parse: ComputerDriverReleaseChecksumParser
}

export type ComputerDriverReleaseChecksumParser = (
  text: string,
  assetName: string,
) => ComputerDriverReleaseChecksumParsedResult

export type ComputerDriverReleaseChecksumParsedResult =
  | ComputerDriverReleaseChecksumParsed
  | ComputerDriverReleaseFailed

export type ComputerDriverReleaseChecksumResult = ComputerDriverReleaseChecksumFound | ComputerDriverReleaseFailed
