import { ChildProcess } from "node:child_process"
import { PassThrough } from "node:stream"

export class IphoneProvisionChildDouble extends ChildProcess {
  constructor() {
    super()
    this.stdout = new PassThrough()
    this.stderr = new PassThrough()
    Object.defineProperty(this, "pid", { value: 321 })
  }
}
