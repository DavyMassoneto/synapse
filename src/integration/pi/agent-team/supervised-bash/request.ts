import { SUPERVISED_BASH_ABORT_EVENT } from "./constants"
import { SupervisedBashDeadline } from "./deadline"
import { type SupervisedBashAbort, type SupervisedBashOptions } from "./types"

export class SupervisedBashRequest {
  readonly deadline: SupervisedBashDeadline
  private readonly signal?: AbortSignal
  private readonly abort: SupervisedBashAbort
  constructor(options: SupervisedBashOptions) {
    this.deadline = new SupervisedBashDeadline(options.timeout)
    this.abort = this.deadline.abort.bind(this.deadline)
    if (options.signal) {
      this.signal = options.signal
      options.signal.addEventListener(SUPERVISED_BASH_ABORT_EVENT, this.abort, { once: true })
      if (options.signal.aborted) {
        this.deadline.abort()
      }
    }
  }
  close(): void {
    this.deadline.close()
    this.signal?.removeEventListener(SUPERVISED_BASH_ABORT_EVENT, this.abort)
  }
}
