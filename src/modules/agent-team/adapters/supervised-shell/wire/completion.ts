import { type ShellWireReject, type ShellWireResolve } from "./types"

export class ShellWireCompletion {
  readonly result: Promise<number>
  settled = false
  private resolve?: ShellWireResolve
  private reject?: ShellWireReject
  constructor() {
    this.result = new Promise<number>(this.capture.bind(this))
    this.result.catch(this.observe.bind(this))
  }
  private capture(resolve: ShellWireResolve, reject: ShellWireReject): void {
    this.resolve = resolve
    this.reject = reject
  }
  private observe(): void {
    this.settled = true
  }
  complete(code: number): void {
    if (!this.settled) {
      this.settled = true
      this.resolve?.(code)
    }
  }
  fail(error: Error): void {
    if (!this.settled) {
      this.settled = true
      this.reject?.(error)
    }
  }
}
