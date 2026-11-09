import { LINE_BREAK } from "../separators"
import { DELETED_FILE_MARKER, IGNORED_FILES } from "./constants"
import { type OptionalChangedFile } from "./types"

export function isIgnored(path: string): boolean {
  return IGNORED_FILES.some((name) => path.endsWith(name))
}

export function isReviewable(file: OptionalChangedFile): boolean {
  return file !== undefined && !isIgnored(file.path)
}

export function isDeleted(section: string): boolean {
  return section.split(LINE_BREAK).includes(DELETED_FILE_MARKER)
}
