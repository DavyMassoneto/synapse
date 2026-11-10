import { BUFFER_OVERFLOW_CODE } from "./constants"

export function isBufferOverflow(error: Error): boolean {
  return "code" in error && error.code === BUFFER_OVERFLOW_CODE
}
