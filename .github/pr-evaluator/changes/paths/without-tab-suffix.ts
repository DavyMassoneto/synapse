import { TAB_SUFFIX_PATTERN } from "./constants"

export function withoutTabSuffix(header: string): string {
  return header.replace(TAB_SUFFIX_PATTERN, "")
}
