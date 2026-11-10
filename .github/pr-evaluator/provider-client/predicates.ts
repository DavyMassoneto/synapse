import { HttpFailure } from "#evaluator/http-failure"
import { SERVER_ERROR_STATUS } from "./constants"

export function isRetryable(error: Error): boolean {
  if (error instanceof HttpFailure) {
    return error.status >= SERVER_ERROR_STATUS
  }
  return error instanceof TypeError
}
