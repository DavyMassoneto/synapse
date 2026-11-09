import { CommandError } from "#synapse/errors"
import { RATE_LIMIT_MARKER } from "./constants"

export function isRateLimited(error: Error): boolean {
  return error instanceof CommandError && error.message.toLowerCase().includes(RATE_LIMIT_MARKER)
}
