import { NO_TEXT } from "../separators"
import { PLACEHOLDER, TEMPLATE_MISMATCH } from "./constants"

export function fillTemplate(template: string, values: readonly string[]): string {
  const parts = template.split(PLACEHOLDER)
  if (parts.length !== values.length + 1) {
    throw new Error(TEMPLATE_MISMATCH)
  }
  return parts.reduce((text, part, index) => text + values.slice(index - 1, index).join(NO_TEXT) + part)
}
