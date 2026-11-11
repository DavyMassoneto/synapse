import { rmSync } from "node:fs"
import { type Failure } from "#synapse/modules/advisor/public/contracts"
import { CLEANUP_FAILED } from "./constants"

export function failureAfterCleanup(temporary: string, error: Error): Failure {
  try {
    rmSync(temporary, { force: true })
    return { kind: "failure", message: error.message }
  } catch (cleanupError) {
    if (cleanupError instanceof Error) {
      return { kind: "failure", message: `${error.message}${CLEANUP_FAILED}${cleanupError.message}` }
    }
    throw cleanupError
  }
}
