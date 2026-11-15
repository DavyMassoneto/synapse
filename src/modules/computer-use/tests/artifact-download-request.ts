import { type ComputerArtifactRequest } from "#synapse/modules/computer-use/adapters/artifact-download"
import { COMPUTER_ARTIFACT_TEST_FILE_NAME } from "./artifact-download-constants"
import { computerArtifactDigest } from "./artifact-download-digest"

export function computerArtifactRequest(baseUrl: string, directory: string, payload: Buffer): ComputerArtifactRequest {
  return {
    url: `${baseUrl}/asset`,
    directory,
    fileName: COMPUTER_ARTIFACT_TEST_FILE_NAME,
    sha256: computerArtifactDigest(payload),
    maxBytes: payload.byteLength,
  }
}
