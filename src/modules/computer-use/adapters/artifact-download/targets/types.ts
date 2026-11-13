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
  kind: "artifact-found"
  artifact: ComputerPinnedArtifact
}

export interface ComputerArtifactAbsent {
  kind: "artifact-absent"
}

export type ComputerArtifactLookup = ComputerArtifactFound | ComputerArtifactAbsent
