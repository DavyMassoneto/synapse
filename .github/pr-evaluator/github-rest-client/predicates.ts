import { REQUEST_ATTEMPTS } from "./constants"
import { isRateLimited } from "./rate-limit"

export function isRetryableResponse(response: Response, attempt: number): boolean {
  return isRateLimited(response) && attempt < REQUEST_ATTEMPTS
}
