import { SUPERVISED_TEST_KILL_ERROR } from "./constants"

export class CleanupActionScenario {
  readonly error = new Error(SUPERVISED_TEST_KILL_ERROR)
  finished = false
  throwsSynchronously(): Promise<void> {
    throw this.error
  }
  async rejectAsynchronously(): Promise<void> {
    throw this.error
  }
  async complete(): Promise<number> {
    this.finished = true
    return 7
  }
}
