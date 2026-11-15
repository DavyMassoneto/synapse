import {
  SUPERVISED_BASH_ABORTED,
  SUPERVISED_BASH_INVALID_TIMEOUT,
  SUPERVISED_BASH_MAX_TIMEOUT_SECONDS,
  SUPERVISED_BASH_MISSING_ENV,
  SUPERVISED_BASH_TIMEOUT_MAX_MESSAGE,
} from "./constants"
import { type SupervisedBashOptions } from "./types"

export function validateSupervisedBashOptions(options: SupervisedBashOptions): NodeJS.ProcessEnv {
  validateSupervisedBashTimeout(options.timeout)
  if (options.signal?.aborted) {
    throw new Error(SUPERVISED_BASH_ABORTED)
  }
  if (!options.env) {
    throw new Error(SUPERVISED_BASH_MISSING_ENV)
  }
  return options.env
}

export function validateSupervisedBashTimeout(timeout?: number): void {
  if (typeof timeout === "number") {
    if (!Number.isFinite(timeout) || timeout <= 0) {
      throw new Error(SUPERVISED_BASH_INVALID_TIMEOUT)
    }
    if (timeout > SUPERVISED_BASH_MAX_TIMEOUT_SECONDS) {
      throw new Error(SUPERVISED_BASH_TIMEOUT_MAX_MESSAGE)
    }
  }
}
