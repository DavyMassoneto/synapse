import { type ComputerPinnedArtifact } from "#synapse/modules/computer-use/adapters/artifact-download"

export type ComputerServerCallback = () => void

export interface ComputerArtifactServerHandle {
  stop(): Promise<void>
}

export interface ComputerArtifactDownloadSut {
  server: ComputerArtifactServerHandle
  baseUrl: string
  directory: string
  artifact: ComputerPinnedArtifact
}
