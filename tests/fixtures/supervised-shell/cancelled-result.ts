import {
  type SupervisedShellLease,
  type SupervisedShellOutput,
  type SupervisedShellService,
  type SupervisedShellSpec,
} from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_KILL_ERROR,
  SUPERVISED_TEST_OUTPUT_FAILURE,
  SUPERVISED_TEST_QUARANTINED_STATE,
} from "./constants"

export class CancelledResultShell implements SupervisedShellService, SupervisedShellLease {
  readonly id = SUPERVISED_TEST_KILL_ERROR
  readonly state = SUPERVISED_TEST_QUARANTINED_STATE
  readonly completion: Promise<number>
  readonly stopping: Promise<void>
  private readonly completed = Promise.withResolvers<number>()
  private readonly stopSignal = Promise.withResolvers<void>()
  private stopResult?: PromiseWithResolvers<void>
  constructor() {
    this.completion = this.completed.promise
    this.stopping = this.stopSignal.promise
  }
  async create(_spec: SupervisedShellSpec, _output: SupervisedShellOutput): Promise<SupervisedShellLease> {
    return this
  }
  releases = 0
  release(): void {
    this.releases++
  }
  terminate(): Promise<void> {
    if (!this.stopResult) {
      this.stopResult = Promise.withResolvers<void>()
      this.stopSignal.resolve()
    }
    return this.stopResult.promise
  }
  loseOutput(): void {
    this.completed.reject(new Error(SUPERVISED_TEST_OUTPUT_FAILURE))
  }
  finish(failed: boolean): void {
    if (failed) {
      this.stopResult?.reject(new Error(SUPERVISED_TEST_KILL_ERROR))
    } else {
      this.stopResult?.resolve()
    }
  }
  readonly stop = this.terminate.bind(this)
  readonly close = this.terminate.bind(this)
}
