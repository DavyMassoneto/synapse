import { isFenced } from "./predicates"
import { removeFence } from "./remove-fence"

export function unwrapFence(text: string): string {
  const trimmed = text.trim()
  if (isFenced(trimmed)) {
    return removeFence(trimmed).trim()
  }
  return trimmed
}
