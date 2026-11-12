import { type COMPUTER_ARTIFACT_ABSENT, type COMPUTER_ARTIFACT_FOUND } from "../constants"

export interface ComputerPinnedArtifact {
  fileName: string
  sha256: string
}

export interface ComputerArchitectureArtifacts {
  arm64: ComputerPinnedArtifact
  x64: ComputerPinnedArtifact
}

export interface ComputerDriverArtifacts {
  darwin: ComputerArchitectureArtifacts
  linux: ComputerArchitectureArtifacts
  win32: ComputerArchitectureArtifacts
}

export interface ComputerArtifactFound {
  kind: typeof COMPUTER_ARTIFACT_FOUND
  artifact: ComputerPinnedArtifact
}

export interface ComputerArtifactAbsent {
  kind: typeof COMPUTER_ARTIFACT_ABSENT
}

export type ComputerArtifactLookup = ComputerArtifactFound | ComputerArtifactAbsent
