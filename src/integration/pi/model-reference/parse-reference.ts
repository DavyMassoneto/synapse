import { PI_MODEL_REFERENCE_INVALID, PI_MODEL_REFERENCE_SEPARATOR, PI_MODEL_REFERENCE_VALID } from "./constants"
import { type PiModelReference } from "./types"

export function parsePiModelReference(reference: string): PiModelReference {
  const separator = reference.indexOf(PI_MODEL_REFERENCE_SEPARATOR)
  if (separator <= 0 || separator === reference.length - 1) {
    return { kind: PI_MODEL_REFERENCE_INVALID }
  }
  return { kind: PI_MODEL_REFERENCE_VALID, provider: reference.slice(0, separator), id: reference.slice(separator + 1) }
}
