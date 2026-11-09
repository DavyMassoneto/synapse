export const TRANSIENT = new Error("transient")

export class FailingOperation {
  calls = 0
  failures: number

  constructor(failures: number) {
    this.failures = failures
  }

  run(): Promise<string> {
    this.calls += 1
    if (this.calls <= this.failures) {
      return Promise.reject(TRANSIENT)
    }
    return Promise.resolve("ok")
  }
}
