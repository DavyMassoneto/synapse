import { IGNORED_FILES } from "./constants"

export function isIgnored(path: string): boolean {
  return IGNORED_FILES.some((name) => path.endsWith(name))
}
