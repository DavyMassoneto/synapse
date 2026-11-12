import {
  COMPUTER_DRIVER_ARTIFACT_BODY_READ,
  COMPUTER_DRIVER_ARTIFACT_DOWNLOAD_FAILED,
  COMPUTER_DRIVER_ARTIFACT_REFUSED,
  COMPUTER_DRIVER_ARTIFACT_TOO_LARGE,
} from "./constants"
import { type ComputerArtifactBodyResult } from "./types"

export async function computerDownloadArtifactBody(url: string, maxBytes: number): Promise<ComputerArtifactBodyResult> {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    return {
      kind: COMPUTER_DRIVER_ARTIFACT_REFUSED,
      message: `${COMPUTER_DRIVER_ARTIFACT_DOWNLOAD_FAILED} HTTP ${response.status}.`,
    }
  }
  const chunks: Uint8Array[] = []
  const reader = response.body.getReader()
  let total = 0
  let next = await reader.read()
  while (!next.done) {
    total += next.value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      return {
        kind: COMPUTER_DRIVER_ARTIFACT_REFUSED,
        message: `${COMPUTER_DRIVER_ARTIFACT_TOO_LARGE} ${maxBytes} bytes.`,
      }
    }
    chunks.push(next.value)
    next = await reader.read()
  }
  return { kind: COMPUTER_DRIVER_ARTIFACT_BODY_READ, bytes: Buffer.concat(chunks) }
}
