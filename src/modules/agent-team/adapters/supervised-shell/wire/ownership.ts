import { SHELL_WIRE_INVALID, SHELL_WIRE_STOP_WAIT_MS } from "./constants"
import { type ShellWireProcess, type ShellWireReject } from "./types"

export class ShellWireOwnership {
  private readonly child: ShellWireProcess
  private readonly failed: ShellWireReject
  private readonly closure = Promise.withResolvers<void>()
  private readonly termination = Promise.withResolvers<void>()
  private failure?: Error
  private closed = false
  private stopping?: Promise<void>
  constructor(child: ShellWireProcess, failed: ShellWireReject) {
    this.child = child
    this.failed = failed
  }
  get requested(): boolean {
    return Boolean(this.stopping)
  }
  close(): void {
    this.closed = true
    this.closure.resolve()
  }
  stop(): Promise<void> {
    if (!this.stopping) {
      this.stopping = this.termination.promise
      this.run().then(this.finish.bind(this), this.fail.bind(this))
    }
    return this.stopping
  }
  private async run(): Promise<void> {
    if (this.closed) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    const timer = setTimeout(this.expired.bind(this), SHELL_WIRE_STOP_WAIT_MS)
    try {
      this.child.terminate()
      await this.closure.promise
      await this.child.confirmEmpty()
      if (this.failure) {
        throw this.failure
      }
    } finally {
      clearTimeout(timer)
    }
  }
  private finish(): void {
    if (!this.failure) {
      this.termination.resolve()
    }
  }
  private expired(): void {
    this.fail(new Error(SHELL_WIRE_INVALID))
  }
  private fail(error: Error): void {
    if (!this.failure) {
      this.failure = error
      this.failed(error)
      this.termination.reject(error)
    }
  }
}
