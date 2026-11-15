import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import { COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED, COMPUTER_DRIVER_RELEASE_CODE_BLOCK_PATTERN } from "./constants"
import { computerParseDriverReleaseSha256Sums } from "./parse-sha256-sums"
import { type ComputerDriverReleaseChecksumParsedResult } from "./types"

export function computerParseDriverReleaseChecksumsText(
  text: string,
  assetName: string,
): ComputerDriverReleaseChecksumParsedResult {
  const match = COMPUTER_DRIVER_RELEASE_CODE_BLOCK_PATTERN.exec(text)
  if (!match) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
  }
  const block = match[1]
  if (!block) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
  }
  return computerParseDriverReleaseSha256Sums(block, assetName)
}
