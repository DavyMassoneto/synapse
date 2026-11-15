import { SHELL_WIRE_INVALID, SHELL_WIRE_STOP_WAIT_MS } from "./constants"
import { type ShellWireProcess, type ShellWireReadyResolve, type ShellWireReject } from "./types"

export class ShellWireOwnership {
  private readonly child: ShellWireProcess
  private readonly failed: ShellWireReject
  private closeResolve?: ShellWireReadyResolve
  private reject?: ShellWireReject
  private resolve?: ShellWireReadyResolve
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
    this.closeResolve?.()
  }
  stop(): Promise<void> {
    if (!this.stopping) {
      this.stopping = new Promise<void>(this.capture.bind(this))
      this.run().then(this.finish.bind(this), this.fail.bind(this))
    }
    return this.stopping
  }
  private capture(resolve: ShellWireReadyResolve, reject: ShellWireReject): void {
    this.resolve = resolve
    this.reject = reject
  }
  private captureClose(resolve: ShellWireReadyResolve): void {
    this.closeResolve = resolve
  }
  private async run(): Promise<void> {
    if (this.closed) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    const closed = new Promise<void>(this.captureClose.bind(this))
    const timer = setTimeout(this.expired.bind(this), SHELL_WIRE_STOP_WAIT_MS)
    try {
      this.child.terminate()
      await closed
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
      this.resolve?.()
    }
  }
  private expired(): void {
    this.fail(new Error(SHELL_WIRE_INVALID))
  }
  private fail(error: Error): void {
    if (!this.failure) {
      this.failure = error
      this.failed(error)
      this.reject?.(error)
    }
  }
}
