import { type ParsedReference } from "./types"

export function parseModelReference(reference: string): ParsedReference {
  const separator = reference.indexOf("/")
  if (separator <= 0 || separator === reference.length - 1) {
    return { kind: "invalid" }
  }
  return { kind: "valid", provider: reference.slice(0, separator), id: reference.slice(separator + 1) }
}
