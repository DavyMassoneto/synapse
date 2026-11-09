import { LINE_BREAK } from "#synapse/separators"
import { DELETED_FILE_MARKER, IGNORED_FILES } from "./constants"

export function isIgnored(path: string): boolean {
  return IGNORED_FILES.some((name) => path.endsWith(name))
}

export function isDeleted(section: string): boolean {
  return section.split(LINE_BREAK).includes(DELETED_FILE_MARKER)
}
