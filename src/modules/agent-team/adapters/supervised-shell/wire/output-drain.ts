import { type Readable } from "node:stream"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { type ShellWireReadyResolve, type ShellWireReject } from "./types"

export class ShellOutputDrain {
  bytes = 0
  ended = false
  fenced = false
  private accepted = 0
  private minimum = 0
  private fencing = false
  private chain = Promise.resolve()
  private readonly input: Readable
  private readonly sink: SupervisedShellOutput
  private readonly updated: ShellWireReadyResolve
  private readonly failed: ShellWireReject
  constructor(input: Readable, sink: SupervisedShellOutput, updated: ShellWireReadyResolve, failed: ShellWireReject) {
    this.input = input
    this.sink = sink
    this.updated = updated
    this.failed = failed
    input.on("data", this.receive.bind(this))
    input.on("end", this.finish.bind(this))
  }
  private receive(data: Buffer): void {
    this.accepted += data.length
    this.input.pause()
    this.chain = this.chain.then(this.write.bind(this, data))
    this.chain.then(this.resume.bind(this), this.failed)
  }
  private async write(data: Buffer): Promise<void> {
    await this.sink.write(data)
    this.bytes += data.length
    this.checkFence()
  }
  fence(minimum: number): void {
    this.minimum = minimum
    this.fencing = true
    this.input.resume()
    setImmediate(this.checkFence.bind(this))
  }
  private checkFence(): void {
    if (this.fencing && this.bytes >= this.minimum && this.bytes >= this.accepted && this.input.readableLength === 0) {
      this.chain.then(this.completeFence.bind(this), this.failed)
    }
  }
  private completeFence(): void {
    this.fenced = true
    this.updated()
  }
  private resume(): void {
    this.input.resume()
  }
  private finish(): void {
    this.chain.then(this.finished.bind(this), this.failed)
  }
  private finished(): void {
    this.ended = true
    this.updated()
  }
}
