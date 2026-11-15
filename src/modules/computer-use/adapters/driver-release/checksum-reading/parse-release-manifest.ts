import { Value } from "typebox/value"
import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import { COMPUTER_DRIVER_RELEASE_MANIFEST_SCHEMA } from "../schemas"
import { COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED, COMPUTER_DRIVER_RELEASE_CHECKSUM_PARSED } from "./constants"
import { type ComputerDriverReleaseChecksumParsedResult } from "./types"

export function computerParseDriverReleaseManifest(
  text: string,
  assetName: string,
): ComputerDriverReleaseChecksumParsedResult {
  try {
    const manifest = Value.Parse(COMPUTER_DRIVER_RELEASE_MANIFEST_SCHEMA, JSON.parse(text))
    const names = new Set<string>()
    for (const asset of manifest.assets) {
      if (names.has(asset.name)) {
        return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
      }
      names.add(asset.name)
    }
    const entry = manifest.assets.find((asset) => asset.name === assetName)
    if (!entry) {
      return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
    }
    return { kind: COMPUTER_DRIVER_RELEASE_CHECKSUM_PARSED, sha256: entry.sha256 }
  } catch {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_CHECKSUM_MALFORMED }
  }
}
