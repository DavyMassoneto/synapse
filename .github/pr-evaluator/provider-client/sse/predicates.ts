import { NON_BLANK_PATTERN } from "./constants"

export function hasModelText(content: string): boolean {
  return NON_BLANK_PATTERN.test(content)
}
