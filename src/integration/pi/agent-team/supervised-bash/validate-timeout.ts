import {
  SUPERVISED_BASH_INVALID_TIMEOUT,
  SUPERVISED_BASH_MAX_TIMEOUT_SECONDS,
  SUPERVISED_BASH_TIMEOUT_MAX_MESSAGE,
} from "./constants"

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
