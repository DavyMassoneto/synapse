import { THINKING_LEVELS } from "./constants"
import { type ThinkingLevel } from "./types"

export function isThinkingLevel(value: string): value is ThinkingLevel {
  return THINKING_LEVELS.some((level) => level === value)
}
