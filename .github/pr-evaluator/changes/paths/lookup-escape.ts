import { ESCAPES } from "./constants"

export function lookupEscape(sequence: string): string {
  const decoded = ESCAPES.get(sequence)
  if (typeof decoded === "string") {
    return decoded
  }
  return sequence
}
