import { PLACEHOLDER_PATTERN } from "./constants"
import { placeholderValue } from "./placeholder-value"
import { placeholderValues } from "./placeholder-values"
import { type PromptContext } from "./types"

export function fillTemplate(context: PromptContext, diff: string): string {
  const values = placeholderValues(context, diff)
  return context.template.replace(PLACEHOLDER_PATTERN, (placeholder) => placeholderValue(values, placeholder))
}
