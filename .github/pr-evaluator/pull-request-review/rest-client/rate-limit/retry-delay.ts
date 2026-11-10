import { DEFAULT_RETRY_SECONDS, MILLISECONDS_PER_SECOND } from "./constants"
import { headerOf } from "./header-of"

export function retryDelayMs(response: Response): number {
  const seconds = Number(headerOf(response, "retry-after"))
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * MILLISECONDS_PER_SECOND
  }
  return DEFAULT_RETRY_SECONDS * MILLISECONDS_PER_SECOND
}
