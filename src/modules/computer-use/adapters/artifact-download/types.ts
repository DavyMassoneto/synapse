import {
  type COMPUTER_DRIVER_ARTIFACT_BODY_READ,
  type COMPUTER_DRIVER_ARTIFACT_CHECKSUM_VALID,
  type COMPUTER_DRIVER_ARTIFACT_DOWNLOADED,
  type COMPUTER_DRIVER_ARTIFACT_REFUSED,
} from "./constants"
import { type ComputerPinnedArtifact } from "./targets"

export interface ComputerArtifactRequest {
  baseUrl: string
  directory: string
  artifact: ComputerPinnedArtifact
  maxBytes: number
}

export interface ComputerArtifactDownloaded {
  kind: typeof COMPUTER_DRIVER_ARTIFACT_DOWNLOADED
  archive: string
}

export interface ComputerArtifactRefused {
  kind: typeof COMPUTER_DRIVER_ARTIFACT_REFUSED
  message: string
}

export type ComputerArtifactDownloadResult = ComputerArtifactDownloaded | ComputerArtifactRefused

export interface ComputerArtifactBodyRead {
  kind: typeof COMPUTER_DRIVER_ARTIFACT_BODY_READ
  bytes: Uint8Array
}

export type ComputerArtifactBodyResult = ComputerArtifactBodyRead | ComputerArtifactRefused

export interface ComputerArtifactChecksumValid {
  kind: typeof COMPUTER_DRIVER_ARTIFACT_CHECKSUM_VALID
}

export type ComputerArtifactChecksumResult = ComputerArtifactChecksumValid | ComputerArtifactRefused
