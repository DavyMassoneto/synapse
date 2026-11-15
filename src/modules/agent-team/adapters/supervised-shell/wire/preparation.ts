import { SHELL_WIRE_INVALID, SHELL_WIRE_PREPARATION_WAIT_MS } from "./constants"
import { type ShellWireReject } from "./types"

export class ShellWirePreparation {
  private readonly deferred = Promise.withResolvers<void>()
  readonly result = this.deferred.promise
  private failure?: Error
  private failedResult?: Promise<void>
  private timer?: ReturnType<typeof setTimeout>
  private readonly expired: ShellWireReject
  constructor(expired: ShellWireReject) {
    this.expired = expired
    this.result.catch(this.observe.bind(this))
    this.timer = setTimeout(this.timeout.bind(this), SHELL_WIRE_PREPARATION_WAIT_MS)
  }
  private observe(error: Error): void {
    this.failure = error
  }
  private timeout(): void {
    const error = new Error(SHELL_WIRE_INVALID)
    this.fail(error)
    this.expired(error)
  }
  ready(): void {
    clearTimeout(this.timer)
    if (!this.failure) {
      this.deferred.resolve()
    }
  }
  current(): Promise<void> {
    if (this.failedResult) {
      return this.failedResult
    }
    return this.result
  }
  fail(error: Error): void {
    clearTimeout(this.timer)
    if (!this.failure) {
      this.failure = error
      this.failedResult = Promise.reject(error)
      this.failedResult.catch(this.observe.bind(this))
      this.deferred.reject(error)
    }
  }
}
