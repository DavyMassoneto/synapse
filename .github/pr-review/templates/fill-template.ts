import { NO_TEXT } from "../separators"
import { PLACEHOLDER, TEMPLATE_MISMATCH } from "./constants"

export function fillTemplate(template: string, values: readonly string[]): string {
  const segments = template.split(PLACEHOLDER)
  if (segments.length !== values.length + 1) {
    throw new Error(TEMPLATE_MISMATCH)
  }
  let text = NO_TEXT
  for (const [index, segment] of segments.entries()) {
    if (index > 0) {
      const replacement = values.at(index - 1)
      if (replacement === undefined) {
        throw new Error(TEMPLATE_MISMATCH)
      }
      text += replacement
    }
    text += segment
  }
  return text
}
