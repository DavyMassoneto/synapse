import { BUFFER_OVERFLOW_CODE, LOCKFILE, SOURCE_PATTERN } from "./constants"

export function isSourceFile(path: string): boolean {
  return SOURCE_PATTERN.test(path) && !path.endsWith(LOCKFILE)
}

export function isBufferOverflow(error: Error): boolean {
  return "code" in error && error.code === BUFFER_OVERFLOW_CODE
}
