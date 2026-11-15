import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import {
  COMPUTER_DRIVER_RELEASE_ASSET_DIGEST_PATTERN,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_PARSED,
} from "./constants"
import { type ComputerDriverReleaseChecksumParsedResult } from "./types"

export function computerParseDriverReleaseAssetDigest(digest: string): ComputerDriverReleaseChecksumParsedResult {
  const match = COMPUTER_DRIVER_RELEASE_ASSET_DIGEST_PATTERN.exec(digest)
  const sha256 = match?.[1]
  if (!sha256) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
  }
  return { kind: COMPUTER_DRIVER_RELEASE_CHECKSUM_PARSED, sha256 }
}
