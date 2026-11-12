import { createHash } from "node:crypto"
import {
  COMPUTER_DRIVER_ARTIFACT_CHECKSUM_MISMATCH,
  COMPUTER_DRIVER_ARTIFACT_CHECKSUM_VALID,
  COMPUTER_DRIVER_ARTIFACT_HASH_ALGORITHM,
  COMPUTER_DRIVER_ARTIFACT_HASH_ENCODING,
  COMPUTER_DRIVER_ARTIFACT_REFUSED,
} from "./constants"
import { type ComputerArtifactChecksumResult } from "./types"

export function computerVerifyArtifactChecksum(bytes: Uint8Array, expected: string): ComputerArtifactChecksumResult {
  const digest = createHash(COMPUTER_DRIVER_ARTIFACT_HASH_ALGORITHM)
    .update(bytes)
    .digest(COMPUTER_DRIVER_ARTIFACT_HASH_ENCODING)
  if (digest !== expected) {
    return { kind: COMPUTER_DRIVER_ARTIFACT_REFUSED, message: COMPUTER_DRIVER_ARTIFACT_CHECKSUM_MISMATCH }
  }
  return { kind: COMPUTER_DRIVER_ARTIFACT_CHECKSUM_VALID }
}
