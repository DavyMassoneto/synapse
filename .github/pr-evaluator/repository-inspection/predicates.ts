import { NO_MATCH_EXIT_CODE } from "./constants"

export function isNoMatch(error: Error): boolean {
  return error.cause instanceof Error && "status" in error.cause && error.cause.status === NO_MATCH_EXIT_CODE
}
