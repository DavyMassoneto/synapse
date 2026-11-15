export interface ComputerArtifactRequest {
  url: string
  directory: string
  fileName: string
  sha256: string
  maxBytes: number
}

export interface ComputerArtifactDownloaded {
  kind: "artifact-downloaded"
  archive: string
}

export interface ComputerArtifactRefused {
  kind: "artifact-refused"
  message: string
}

export type ComputerArtifactDownloadResult = ComputerArtifactDownloaded | ComputerArtifactRefused

export interface ComputerArtifactBodyRead {
  kind: "artifact-body-read"
  bytes: Uint8Array
}

export type ComputerArtifactBodyResult = ComputerArtifactBodyRead | ComputerArtifactRefused

export interface ComputerArtifactChecksumValid {
  kind: "checksum-valid"
}

export type ComputerArtifactChecksumResult = ComputerArtifactChecksumValid | ComputerArtifactRefused
