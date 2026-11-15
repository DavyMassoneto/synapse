export class MjpegBindGate {
  readonly entered = Promise.withResolvers<void>()

  readonly released = Promise.withResolvers<void>()

  private calls = 0

  private readonly heldCall: number

  constructor(heldCall: number) {
    this.heldCall = heldCall
  }

  bind(): Promise<void> {
    this.calls++
    if (this.calls === this.heldCall) {
      this.entered.resolve()
      return this.released.promise
    }
    return Promise.resolve()
  }
}
