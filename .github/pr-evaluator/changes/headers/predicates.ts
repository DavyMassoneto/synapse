import { DIFF_FILE_HEADER, HUNK_START_PATTERN, NEW_FILE_HEADER, OLD_FILE_HEADER } from "./constants"

export function isFileHeader(line: string): boolean {
  return line.startsWith(DIFF_FILE_HEADER)
}

export function isPathHeader(line: string): boolean {
  return line.startsWith(OLD_FILE_HEADER) || line.startsWith(NEW_FILE_HEADER)
}

export function isHunkHeader(line: string): boolean {
  return HUNK_START_PATTERN.test(line)
}
