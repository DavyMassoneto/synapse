import { PLACEHOLDER_ARCHITECTURE, PLACEHOLDER_DIFF, PLACEHOLDER_RULES, PLACEHOLDER_STANDARDS } from "./constants"
import { type PromptContext } from "./types"

export function placeholderValues(context: PromptContext, diff: string): Map<string, string> {
  return new Map<string, string>([
    [PLACEHOLDER_ARCHITECTURE, context.architecture],
    [PLACEHOLDER_RULES, context.rules],
    [PLACEHOLDER_STANDARDS, context.standards],
    [PLACEHOLDER_DIFF, diff],
  ])
}
