import { SUPERVISED_BASH_ABORTED, SUPERVISED_BASH_MISSING_ENV } from "./constants"
import { type SupervisedBashOptions } from "./types"
import { validateSupervisedBashTimeout } from "./validate-timeout"

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
