import { HttpStatusError } from "../errors"
import { RETRY_STATUSES, TRANSIENT_ERROR_NAMES } from "./constants"

export function isRetryable(error: Error): boolean {
  if (error instanceof HttpStatusError) {
    return RETRY_STATUSES.includes(error.status)
  }
  return error instanceof TypeError || TRANSIENT_ERROR_NAMES.includes(error.name)
}
