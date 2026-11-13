import { MODEL_REFERENCE_INVALID, MODEL_REFERENCE_VALID, REFERENCE_SEPARATOR } from "./constants"
import { type ParsedReference } from "./types"

export function parseModelReference(reference: string): ParsedReference {
  const separator = reference.indexOf(REFERENCE_SEPARATOR)
  if (separator <= 0 || separator === reference.length - 1) {
    return { kind: MODEL_REFERENCE_INVALID }
  }
  return { kind: MODEL_REFERENCE_VALID, provider: reference.slice(0, separator), id: reference.slice(separator + 1) }
}
