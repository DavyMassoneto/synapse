import { type SupervisedShellLease } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_BASH_MILLISECONDS_PER_SECOND, SUPERVISED_BASH_TIMEOUT_PREFIX } from "./constants"
import { type SupervisedBashFailureReject, type SupervisedBashNeverResolve, type SupervisedBashTimer } from "./types"

export class SupervisedBashDeadline {
  private readonly lease: SupervisedShellLease
  private readonly seconds?: number
  private timer: SupervisedBashTimer
  private expired = false
  private failure?: Error
  private rejectFailure?: SupervisedBashFailureReject
  readonly failed: Promise<never>
  constructor(lease: SupervisedShellLease, seconds?: number) {
    this.failed = new Promise<never>(this.captureFailure.bind(this))
    this.lease = lease
    if (seconds) {
      this.seconds = seconds
      this.timer = setTimeout(this.expire.bind(this), seconds * SUPERVISED_BASH_MILLISECONDS_PER_SECOND)
    }
  }
  private captureFailure(_resolve: SupervisedBashNeverResolve, reject: SupervisedBashFailureReject): void {
    this.rejectFailure = reject
  }
  private expire(): void {
    this.expired = true
    this.abort()
  }
  abort(): void {
    this.lease.terminate().catch(this.recordFailure.bind(this))
  }
  private recordFailure(error: Error): void {
    this.failure = error
    this.rejectFailure?.(error)
  }
  check(): void {
    if (this.failure) {
      throw this.failure
    }
    if (this.expired) {
      throw new Error(`${SUPERVISED_BASH_TIMEOUT_PREFIX}${this.seconds}`)
    }
  }
  close(): void {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }
}
