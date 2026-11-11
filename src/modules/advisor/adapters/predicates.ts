import { MISSING_FILE_CODE } from "./constants"

export function isMissingFile(error: Error): boolean {
  return "code" in error && error.code === MISSING_FILE_CODE
}
