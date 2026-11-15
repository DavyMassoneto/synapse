import { type SupervisedShellLease } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_BASH_CLOSE_FAILURE } from "./constants"
import { type SupervisedBashDeadline } from "./deadline"
import { type SupervisedBashFailureReject, type SupervisedBashNeverResolve } from "./types"

export class SupervisedBashExecution {
  private readonly lease: SupervisedShellLease
  private readonly deadline: SupervisedBashDeadline
  private reject?: SupervisedBashFailureReject
  private readonly cancelled: Promise<never>
  private stopping?: Promise<void>
  constructor(lease: SupervisedShellLease, deadline: SupervisedBashDeadline) {
    this.lease = lease
    this.deadline = deadline
    this.cancelled = new Promise<never>(this.capture.bind(this))
  }
  private capture(_resolve: SupervisedBashNeverResolve, reject: SupervisedBashFailureReject): void {
    this.reject = reject
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
    this.reject?.(error)
  }
  private async failedResult(error: Error): Promise<never> {
    if (this.stopping) {
      try {
        await this.stopping
      } catch (failure) {
        if (failure instanceof Error && failure !== error) {
          throw new AggregateError([error, failure], SUPERVISED_BASH_CLOSE_FAILURE)
        }
        if (typeof failure === "string") {
          throw new AggregateError([error, new Error(failure)], SUPERVISED_BASH_CLOSE_FAILURE)
        }
        if (!(failure instanceof Error)) {
          throw new AggregateError([error, new Error(SUPERVISED_BASH_CLOSE_FAILURE)], SUPERVISED_BASH_CLOSE_FAILURE)
        }
      }
    }
    throw error
  }
  private async result(): Promise<number> {
    try {
      return await Promise.race([this.lease.completion, this.cancelled])
    } catch (failure) {
      if (failure instanceof Error) {
        return this.failedResult(failure)
      }
      if (typeof failure === "string") {
        return this.failedResult(new Error(failure))
      }
      return this.failedResult(new Error(SUPERVISED_BASH_CLOSE_FAILURE))
    }
  }
  async run(): Promise<number> {
    const signal = this.deadline.cancellation.signal
    const cancel = this.cancel.bind(this)
    signal.addEventListener("abort", cancel, { once: true })
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
      signal.removeEventListener("abort", cancel)
    }
  }
}
