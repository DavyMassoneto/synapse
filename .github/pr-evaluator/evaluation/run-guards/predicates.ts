import { NON_BLANK_PATTERN } from "./constants"

export function hasDiffContent(rawDiff: string): boolean {
  return NON_BLANK_PATTERN.test(rawDiff)
}
