import { SERVER_ERROR_STATUS } from "./constants"
import { ModelHttpError } from "./model-http-error"

export function isRetryable(error: Error): boolean {
  if (error instanceof ModelHttpError) {
    return error.status >= SERVER_ERROR_STATUS
  }
  return error instanceof TypeError
}
