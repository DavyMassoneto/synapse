import { Value } from "typebox/value"
import { COMPUTER_DRIVER_RELEASE_FAILED, COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE } from "../constants"
import { COMPUTER_DRIVER_RELEASE_SCHEMA } from "../schemas"
import { COMPUTER_DRIVER_RELEASE_DETAIL_PARSED } from "./constants"
import { type ComputerDriverReleaseDetailParsedResult } from "./types"

export function computerParseDriverReleaseDetail(text: string, tag: string): ComputerDriverReleaseDetailParsedResult {
  try {
    const release = Value.Parse(COMPUTER_DRIVER_RELEASE_SCHEMA, JSON.parse(text))
    if (release.tag_name !== tag) {
      return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
    }
    return { kind: COMPUTER_DRIVER_RELEASE_DETAIL_PARSED, release }
  } catch {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
  }
}
