import { PLACEHOLDER_ARCHITECTURE, PLACEHOLDER_DIFF, PLACEHOLDER_RULES, PLACEHOLDER_STANDARDS } from "./constants"
import { type PromptContext } from "./types"

export function fillTemplate(context: PromptContext, diff: string): string {
  return context.template
    .split(PLACEHOLDER_ARCHITECTURE)
    .join(context.architecture)
    .split(PLACEHOLDER_RULES)
    .join(context.rules)
    .split(PLACEHOLDER_STANDARDS)
    .join(context.standards)
    .split(PLACEHOLDER_DIFF)
    .join(diff)
}
