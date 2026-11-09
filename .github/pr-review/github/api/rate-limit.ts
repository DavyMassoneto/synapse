import { type CommandError } from "#synapse/errors"
import {
  MILLISECONDS_PER_SECOND,
  RATE_LIMIT_BACKOFF_MS,
  REMAINING_ZERO_HEADER,
  RESET_HEADER,
  RETRY_AFTER_HEADER,
} from "./constants"

export function rateLimitDelay(error: CommandError, attempt: number, now: number): number {
  const headers = error.response
  const retryAfter = RETRY_AFTER_HEADER.exec(headers)?.at(1)
  if (retryAfter !== undefined) {
    return Number(retryAfter) * MILLISECONDS_PER_SECOND
  }
  const reset = RESET_HEADER.exec(headers)?.at(1)
  if (REMAINING_ZERO_HEADER.test(headers) && reset !== undefined) {
    return Math.max(0, Number(reset) * MILLISECONDS_PER_SECOND - now)
  }
  return RATE_LIMIT_BACKOFF_MS * 2 ** (attempt - 1)
}
