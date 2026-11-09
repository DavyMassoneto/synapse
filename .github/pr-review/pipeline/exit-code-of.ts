import { VERDICT_OK, type Verdict } from "../review"
import { EXIT_FAILURE, EXIT_SUCCESS } from "./constants"

export function exitCodeOf(verdict: Verdict): number {
  if (verdict === VERDICT_OK) {
    return EXIT_SUCCESS
  }
  return EXIT_FAILURE
}
