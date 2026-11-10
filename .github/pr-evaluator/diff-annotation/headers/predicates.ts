import { NEW_FILE_HEADER, OLD_FILE_HEADER } from "./constants"

export function isPathHeader(line: string): boolean {
  return line.startsWith(OLD_FILE_HEADER) || line.startsWith(NEW_FILE_HEADER)
}
