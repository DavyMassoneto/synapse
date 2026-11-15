import {
  SUPERVISED_BASH_ABORTED,
  SUPERVISED_BASH_MILLISECONDS_PER_SECOND,
  SUPERVISED_BASH_TIMEOUT_PREFIX,
} from "./constants"
import { type SupervisedBashTimer } from "./types"

export class SupervisedBashDeadline {
  readonly cancellation = new AbortController()
  private readonly seconds?: number
  private timer: SupervisedBashTimer
  private expired = false
  constructor(seconds?: number) {
    if (seconds) {
      this.seconds = seconds
    }
  }
  start(): void {
    if (this.seconds) {
      this.timer = setTimeout(this.expire.bind(this), this.seconds * SUPERVISED_BASH_MILLISECONDS_PER_SECOND)
    }
  }
  private expire(): void {
    this.expired = true
    this.abort()
  }
  abort(): void {
    if (this.expired) {
      this.cancellation.abort(new Error(`${SUPERVISED_BASH_TIMEOUT_PREFIX}${this.seconds}`))
    } else {
      this.cancellation.abort(new Error(SUPERVISED_BASH_ABORTED))
    }
  }
  check(): void {
    if (this.expired) {
      throw new Error(`${SUPERVISED_BASH_TIMEOUT_PREFIX}${this.seconds}`)
    }
    if (this.cancellation.signal.aborted) {
      throw new Error(SUPERVISED_BASH_ABORTED)
    }
  }
  close(): void {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }
}
