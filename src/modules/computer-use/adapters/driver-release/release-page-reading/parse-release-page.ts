import { Value } from "typebox/value"
import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import { COMPUTER_DRIVER_RELEASE_PAGE_SCHEMA } from "../schemas"
import { COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE, COMPUTER_DRIVER_RELEASE_PAGE_PARSED } from "./constants"
import { type ComputerDriverReleasePageParsedResult } from "./types"

export function computerParseDriverReleasePage(text: string): ComputerDriverReleasePageParsedResult {
  try {
    return {
      kind: COMPUTER_DRIVER_RELEASE_PAGE_PARSED,
      releases: Value.Parse(COMPUTER_DRIVER_RELEASE_PAGE_SCHEMA, JSON.parse(text)),
    }
  } catch {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
  }
}
