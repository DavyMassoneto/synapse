import { DIFF_FILE_HEADER, OLD_START_PATTERN } from "./constants"

export function isFileHeader(line: string): boolean {
  return line.startsWith(DIFF_FILE_HEADER)
}

export function isHunkHeader(line: string): boolean {
  return OLD_START_PATTERN.test(line)
}
