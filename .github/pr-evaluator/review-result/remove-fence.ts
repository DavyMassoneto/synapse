import { FENCE_PATTERN } from "./constants"

export function removeFence(text: string): string {
  return text.replace(FENCE_PATTERN, "$1")
}
