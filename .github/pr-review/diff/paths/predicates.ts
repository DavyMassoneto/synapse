import { LINE_BREAK } from "#synapse/separators"
import { BINARY_DELETION, DELETED_FILE_MARKER } from "./constants"

export function isDeleted(section: string): boolean {
  return section.split(LINE_BREAK).includes(DELETED_FILE_MARKER) || BINARY_DELETION.test(section)
}
