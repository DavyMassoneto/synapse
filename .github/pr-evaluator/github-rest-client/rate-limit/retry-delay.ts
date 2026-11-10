import { DEFAULT_RETRY_SECONDS, MILLISECONDS_PER_SECOND } from "./constants"
import { hasRetryAfterSeconds } from "./predicates"

export function retryDelayMs(response: Response): number {
  const seconds = Number(response.headers.get("retry-after"))
  if (hasRetryAfterSeconds(seconds)) {
    return seconds * MILLISECONDS_PER_SECOND
  }
  return DEFAULT_RETRY_SECONDS * MILLISECONDS_PER_SECOND
}
