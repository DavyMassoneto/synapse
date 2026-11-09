import { HttpStatusError } from "../errors"
import { RETRY_STATUSES, SSE_DATA_PREFIX, TRANSIENT_ERROR_NAMES } from "./constants"

export function isRetryable(error: Error): boolean {
  if (error instanceof HttpStatusError) {
    return RETRY_STATUSES.includes(error.status)
  }
  return error instanceof TypeError || TRANSIENT_ERROR_NAMES.includes(error.name)
}

export function isDataLine(line: string): boolean {
  return line.startsWith(SSE_DATA_PREFIX)
}
