import { Value } from "typebox/value"
import { COMPUTER_DRIVER_RELEASE_FAILED, COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE } from "../constants"
import { COMPUTER_DRIVER_RELEASE_TAG_REFS_SCHEMA } from "../schemas"
import { COMPUTER_DRIVER_RELEASE_TAG_REFS_PARSED } from "./constants"
import { type ComputerDriverReleaseTagRefsParsedResult } from "./types"

export function computerParseDriverReleaseTagRefs(text: string): ComputerDriverReleaseTagRefsParsedResult {
  try {
    const refs = Value.Parse(COMPUTER_DRIVER_RELEASE_TAG_REFS_SCHEMA, JSON.parse(text))
    return {
      kind: COMPUTER_DRIVER_RELEASE_TAG_REFS_PARSED,
      refs: refs.map((entry) => entry.ref),
    }
  } catch {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
  }
}
