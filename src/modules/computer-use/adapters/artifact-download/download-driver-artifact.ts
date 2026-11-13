import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { computerVerifyArtifactChecksum } from "./checksum"
import {
  COMPUTER_DRIVER_ARTIFACT_CHECKSUM_VALID,
  COMPUTER_DRIVER_ARTIFACT_DOWNLOADED,
  COMPUTER_DRIVER_ARTIFACT_FILE_MODE,
  COMPUTER_DRIVER_ARTIFACT_NAME_PREFIX,
  COMPUTER_DRIVER_ARTIFACT_REFUSED,
  COMPUTER_DRIVER_ARTIFACT_VERSION,
  COMPUTER_DRIVER_TAG_PREFIX,
} from "./constants"
import { computerDownloadArtifactBody } from "./download"
import { type ComputerPinnedArtifact } from "./targets"
import { type ComputerArtifactDownloadResult, type ComputerArtifactRequest } from "./types"

export async function computerDownloadDriverArtifact(
  request: ComputerArtifactRequest,
): Promise<ComputerArtifactDownloadResult> {
  const url = computerArtifactUrl(request.baseUrl, request.artifact)
  const body = await computerDownloadArtifactBody(url, request.maxBytes)
  if (body.kind === COMPUTER_DRIVER_ARTIFACT_REFUSED) {
    return body
  }
  const checksum = computerVerifyArtifactChecksum(body.bytes, request.artifact.sha256)
  if (checksum.kind !== COMPUTER_DRIVER_ARTIFACT_CHECKSUM_VALID) {
    return checksum
  }
  const archive = computerWriteArtifactFile(request.directory, request.artifact.fileName, body.bytes)
  return { kind: COMPUTER_DRIVER_ARTIFACT_DOWNLOADED, archive }
}

function computerArtifactUrl(baseUrl: string, artifact: ComputerPinnedArtifact): string {
  const release = `${COMPUTER_DRIVER_TAG_PREFIX}${COMPUTER_DRIVER_ARTIFACT_VERSION}`
  const file = `${COMPUTER_DRIVER_ARTIFACT_NAME_PREFIX}${COMPUTER_DRIVER_ARTIFACT_VERSION}-${artifact.fileName}`
  return `${baseUrl}/${release}/${file}`
}
function computerWriteArtifactFile(directory: string, fileName: string, bytes: Uint8Array): string {
  const archive = join(directory, fileName)
  mkdirSync(directory, { recursive: true })
  writeFileSync(archive, bytes, { mode: COMPUTER_DRIVER_ARTIFACT_FILE_MODE })
  return archive
}
