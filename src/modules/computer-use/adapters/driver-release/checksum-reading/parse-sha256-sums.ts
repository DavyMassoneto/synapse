import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import {
  COMPUTER_DRIVER_RELEASE_CHECKSUM_LINE_PATTERN,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED,
  COMPUTER_DRIVER_RELEASE_CHECKSUM_PARSED,
  COMPUTER_DRIVER_RELEASE_LINE_BREAK_PATTERN,
} from "./constants"
import { isDriverReleaseChecksumName } from "./predicates"
import { type ComputerDriverReleaseChecksumEntry, type ComputerDriverReleaseChecksumParsedResult } from "./types"

export function computerParseDriverReleaseSha256Sums(
  text: string,
  assetName: string,
): ComputerDriverReleaseChecksumParsedResult {
  const entries: ComputerDriverReleaseChecksumEntry[] = []
  const names = new Set<string>()
  for (const line of text.split(COMPUTER_DRIVER_RELEASE_LINE_BREAK_PATTERN)) {
    const value = line.trim()
    if (!value) {
      continue
    }
    const match = COMPUTER_DRIVER_RELEASE_CHECKSUM_LINE_PATTERN.exec(value)
    if (!match) {
      return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
    }
    const sha256 = match[1]
    const name = match[2]
    if (!sha256 || !name || names.has(name) || !isDriverReleaseChecksumName(name)) {
      return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
    }
    names.add(name)
    entries.push({ name, sha256 })
  }
  const entry = entries.find((candidate) => candidate.name === assetName)
  if (!entry) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
  }
  return { kind: COMPUTER_DRIVER_RELEASE_CHECKSUM_PARSED, sha256: entry.sha256 }
}
