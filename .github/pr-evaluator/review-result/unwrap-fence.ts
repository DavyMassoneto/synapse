import { CODE_FENCE } from "./constants"

export function unwrapFence(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith(CODE_FENCE) && trimmed.endsWith(CODE_FENCE) && trimmed.length > CODE_FENCE.length * 2) {
    return trimmed.slice(trimmed.indexOf("\n") + 1, trimmed.length - CODE_FENCE.length).trim()
  }
  return trimmed
}
