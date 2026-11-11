import { NO_MATCH_STATUS } from "./constants"

export function isNoMatch(error: Error): boolean {
  return "status" in error && error.status === NO_MATCH_STATUS
}
