import { FENCE_PATTERN } from "./constants"

export function isFenced(text: string): boolean {
  return FENCE_PATTERN.test(text)
}
