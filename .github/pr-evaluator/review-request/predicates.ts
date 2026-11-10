import { TEMPLATE_PATTERN } from "./constants"

export function hasTemplate(document: string): boolean {
  return TEMPLATE_PATTERN.test(document)
}
