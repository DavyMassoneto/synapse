import { REFERENCE_SEPARATOR } from "./constants"
import { type ParsedReference } from "./types"

export function formatModelReference(provider: string, id: string): string {
  return `${provider}${REFERENCE_SEPARATOR}${id}`
}

export function parseModelReference(reference: string): ParsedReference {
  const separator = reference.indexOf(REFERENCE_SEPARATOR)
  if (separator <= 0 || separator === reference.length - 1) {
    return { kind: "invalid" }
  }
  return { kind: "valid", provider: reference.slice(0, separator), id: reference.slice(separator + 1) }
}
