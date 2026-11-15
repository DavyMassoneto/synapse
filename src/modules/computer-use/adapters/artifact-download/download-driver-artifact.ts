import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { computerVerifyArtifactChecksum } from "./checksum"
import {
  COMPUTER_DRIVER_ARTIFACT_CHECKSUM_VALID,
  COMPUTER_DRIVER_ARTIFACT_DOWNLOADED,
  COMPUTER_DRIVER_ARTIFACT_FILE_MODE,
  COMPUTER_DRIVER_ARTIFACT_INVALID_NAME,
  COMPUTER_DRIVER_ARTIFACT_REFUSED,
} from "./constants"
import { computerDownloadArtifactBody } from "./download"
import { isComputerArtifactFileNameSafe } from "./predicates"
import { type ComputerArtifactDownloadResult, type ComputerArtifactRequest } from "./types"

export async function computerDownloadDriverArtifact(
  request: ComputerArtifactRequest,
): Promise<ComputerArtifactDownloadResult> {
  if (!isComputerArtifactFileNameSafe(request.fileName)) {
    return { kind: COMPUTER_DRIVER_ARTIFACT_REFUSED, message: COMPUTER_DRIVER_ARTIFACT_INVALID_NAME }
  }
  const body = await computerDownloadArtifactBody(request.url, request.maxBytes)
  if (body.kind === COMPUTER_DRIVER_ARTIFACT_REFUSED) {
    return body
  }
  const checksum = computerVerifyArtifactChecksum(body.bytes, request.sha256)
  if (checksum.kind !== COMPUTER_DRIVER_ARTIFACT_CHECKSUM_VALID) {
    return checksum
  }
  const archive = computerWriteArtifactFile(request.directory, request.fileName, body.bytes)
  return { kind: COMPUTER_DRIVER_ARTIFACT_DOWNLOADED, archive }
}

function computerWriteArtifactFile(directory: string, fileName: string, bytes: Uint8Array): string {
  const archive = join(directory, fileName)
  mkdirSync(directory, { recursive: true })
  writeFileSync(archive, bytes, { mode: COMPUTER_DRIVER_ARTIFACT_FILE_MODE })
  return archive
}
