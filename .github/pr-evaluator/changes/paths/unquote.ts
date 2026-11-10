import { QUOTED_PATTERN } from "./constants"

export function unquote(name: string): string {
  return name.replace(QUOTED_PATTERN, "$1")
}
