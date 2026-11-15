import { type SupervisedShellLease } from "#synapse/modules/agent-team"
import { captureShellCleanup } from "../shell-cleanup"
import { SUPERVISED_BASH_ABORT_EVENT, SUPERVISED_BASH_CLOSE_FAILURE } from "./constants"
import { type SupervisedBashDeadline } from "./deadline"

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
      const stopped = (captureShellCleanup<void>).bind(
        undefined,
        this.deadline.check.bind(this.deadline),
        this.cancellation.reject,
      )
      this.stopping.then(stopped, this.cancellation.reject).catch(this.cancellation.reject)
    }
  }
  private async failedResult(error: Error): Promise<never> {
    if (this.stopping) {
      const outcome = await captureShellCleanup(this.stopping)
      if (outcome.failed && outcome.error !== error) {
        throw new AggregateError([error, outcome.error], SUPERVISED_BASH_CLOSE_FAILURE)
      }
    }
    throw error
  }
  private async result(): Promise<number> {
    const outcome = await captureShellCleanup(Promise.race([this.lease.completion, this.cancelled]))
    if (outcome.failed) {
      return this.failedResult(outcome.error)
    }
    return outcome.value
  }
  private start(signal: AbortSignal): void {
    if (signal.aborted) {
      this.cancel()
    } else {
      this.deadline.start()
      this.lease.release()
    }
  }
  private async confirm(signal: AbortSignal): Promise<void> {
    if (signal.aborted) {
      await this.stopping
      this.deadline.check()
    }
  }

  async run(): Promise<number> {
    const signal = this.deadline.cancellation.signal
    const cancel = this.cancel.bind(this)
    signal.addEventListener(SUPERVISED_BASH_ABORT_EVENT, cancel, { once: true })
    try {
      this.start(signal)
      const code = await this.result()
      await this.confirm(signal)
      return code
    } finally {
      signal.removeEventListener(SUPERVISED_BASH_ABORT_EVENT, cancel)
    }
  }
}
