import {
  SUPERVISED_SHELL_STOP_FAILED,
  type SupervisedShellLease,
} from "#synapse/modules/agent-team/public/supervised-shell"
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
      this.stopping.then(this.stopped.bind(this), this.cancellation.reject)
    }
  }
  private stopped(): void {
    try {
      this.deadline.check()
    } catch (error) {
      if (error instanceof Error) {
        this.cancellation.reject(error)
      } else if (typeof error === "string") {
        this.cancellation.reject(new Error(error))
      } else {
        this.cancellation.reject(new Error(SUPERVISED_SHELL_STOP_FAILED))
      }
    }
  }
  private async failedResult(error: Error): Promise<never> {
    if (this.stopping) {
      try {
        await this.stopping
      } catch (failure) {
        let cleanup = new Error(SUPERVISED_SHELL_STOP_FAILED)
        if (failure instanceof Error) {
          cleanup = failure
        } else if (typeof failure === "string") {
          cleanup = new Error(failure)
        }
        if (cleanup !== error) {
          throw new AggregateError([error, cleanup], SUPERVISED_BASH_CLOSE_FAILURE)
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
      return this.failedResult(new Error(SUPERVISED_SHELL_STOP_FAILED))
    }
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
