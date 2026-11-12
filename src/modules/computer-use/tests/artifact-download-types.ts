import { type ComputerPinnedArtifact } from "#synapse/modules/computer-use/adapters/artifact-download"
import { type ComputerArtifactTestServer } from "./artifact-download-support"

export interface ComputerArtifactDownloadSut {
  server: ComputerArtifactTestServer
  baseUrl: string
  directory: string
  artifact: ComputerPinnedArtifact
}
