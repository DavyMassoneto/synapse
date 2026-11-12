import { createHash } from "node:crypto"
import {
  COMPUTER_ARTIFACT_TEST_HASH_ALGORITHM,
  COMPUTER_ARTIFACT_TEST_HASH_ENCODING,
} from "./artifact-download-constants"

export function computerArtifactDigest(payload: Buffer): string {
  return createHash(COMPUTER_ARTIFACT_TEST_HASH_ALGORITHM).update(payload).digest(COMPUTER_ARTIFACT_TEST_HASH_ENCODING)
}
