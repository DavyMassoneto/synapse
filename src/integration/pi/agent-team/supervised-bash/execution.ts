import { type SupervisedShellLease } from "#synapse/modules/agent-team/public/supervised-shell"
import { captureShellCleanup } from "../shell-cleanup"
import { SUPERVISED_BASH_ABORT_EVENT, SUPERVISED_BASH_CLOSE_FAILURE } from "./constants"
import { type SupervisedBashDeadline } from "./deadline"
import { type SupervisedBashResultPromises } from "./types"

export class SupervisedBashExecution {
  private readonly lease: SupervisedShellLease
  private readonly deadline: SupervisedBashDeadline
  private readonly cancellation = Promise.withResolvers<never>()
  private readonly cancelled = this.cancellation.promise
  private stopping?: Promise<void>
  constructor(lease: SupervisedShellLease, deadline: SupervisedBashDeadline) {
    this.lease = lease
    this.deadline = deadline
  }
  private cancel(): void {
    if (!this.stopping) {
      this.stopping = this.lease.terminate()
      this.stopping.then(this.stopped.bind(this), this.failed.bind(this))
    }
  }
  private stopped(): void {
    try {
      this.deadline.check()
    } catch (error) {
      if (error instanceof Error) {
        this.failed(error)
      } else {
        throw error
      }
    }
  }
  private failed(error: Error): void {
    this.cancellation.reject(error)
  }
  private async failedResult(error: Error): Promise<never> {
    if (this.stopping) {
      const resolve = Promise.resolve<void>
      const outcome = await captureShellCleanup(resolve.bind(Promise, this.stopping))
      if (outcome.failed && outcome.error !== error) {
        throw new AggregateError([error, outcome.error], SUPERVISED_BASH_CLOSE_FAILURE)
      }
    }
    throw error
  }
  private async result(): Promise<number> {
    const race = Promise.race<SupervisedBashResultPromises>
    const result = await captureShellCleanup(race.bind(Promise, [this.lease.completion, this.cancelled]))
    if (result.failed) {
      return this.failedResult(result.error)
    }
    return result.value
  }
  async run(): Promise<number> {
    const signal = this.deadline.cancellation.signal
    const cancel = this.cancel.bind(this)
    signal.addEventListener(SUPERVISED_BASH_ABORT_EVENT, cancel, { once: true })
    try {
      if (signal.aborted) {
        this.cancel()
      } else {
        this.deadline.start()
        this.lease.release()
      }
      const code = await this.result()
      if (signal.aborted) {
        await this.stopping
        this.deadline.check()
      }
      return code
    } finally {
      signal.removeEventListener(SUPERVISED_BASH_ABORT_EVENT, cancel)
    }
  }
}
