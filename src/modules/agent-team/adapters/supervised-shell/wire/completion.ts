export class ShellWireCompletion {
  private readonly deferred = Promise.withResolvers<number>()
  readonly result = this.deferred.promise
  settled = false
  constructor() {
    this.result.catch(this.observe.bind(this))
  }
  private observe(): void {
    this.settled = true
  }
  complete(code: number): void {
    if (!this.settled) {
      this.settled = true
      this.deferred.resolve(code)
    }
  }
  fail(error: Error): void {
    if (!this.settled) {
      this.settled = true
      this.deferred.reject(error)
    }
  }
}
