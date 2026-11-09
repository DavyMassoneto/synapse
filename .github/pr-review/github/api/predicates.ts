import { CommandError } from "#synapse/errors"
import { RATE_LIMIT_MARKER, RATE_LIMIT_STATUS, REMAINING_ZERO_HEADER } from "./constants"

export function isRateLimited(error: Error): boolean {
  if (!(error instanceof CommandError)) {
    return false
  }
  const response = error.response
  return (
    error.message.toLowerCase().includes(RATE_LIMIT_MARKER) ||
    response.toLowerCase().includes(RATE_LIMIT_MARKER) ||
    REMAINING_ZERO_HEADER.test(response) ||
    RATE_LIMIT_STATUS.test(response)
  )
}
