import { EventEmitter, once } from "node:events"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_TEST_WINDOWS_MARKER } from "./constants"

export class SupervisedTestOutput implements SupervisedShellOutput {
  chunks: Buffer[] = []
  private readonly events = new EventEmitter()
  private tail = Buffer.alloc(0)
  private found = false
  async write(data: Buffer): Promise<void> {
    this.chunks.push(data)
    if (!this.found) {
      const marker = Buffer.from(SUPERVISED_TEST_WINDOWS_MARKER)
      const window = Buffer.concat([this.tail, data])
      this.found = window.includes(marker)
      this.tail = window.subarray(Math.max(0, window.length - marker.length + 1))
      if (this.found) {
        this.events.emit(SUPERVISED_TEST_WINDOWS_MARKER)
      }
    }
  }
  async waitForMarker(): Promise<void> {
    if (!this.found) {
      await once(this.events, SUPERVISED_TEST_WINDOWS_MARKER, { signal: AbortSignal.timeout(10000) })
    }
  }
  text(): string {
    return Buffer.concat(this.chunks).toString()
  }
}
