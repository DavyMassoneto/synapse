import { EventEmitter, once } from "node:events"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_TEST_WINDOWS_MARKER } from "./constants"

export class SupervisedTestOutput implements SupervisedShellOutput {
  chunks: Buffer[] = []
  private readonly events = new EventEmitter()
  async write(data: Buffer): Promise<void> {
    this.chunks.push(data)
    if (this.text().includes(SUPERVISED_TEST_WINDOWS_MARKER)) {
      this.events.emit(SUPERVISED_TEST_WINDOWS_MARKER)
    }
  }
  async waitForMarker(): Promise<void> {
    if (!this.text().includes(SUPERVISED_TEST_WINDOWS_MARKER)) {
      await once(this.events, SUPERVISED_TEST_WINDOWS_MARKER, { signal: AbortSignal.timeout(10000) })
    }
  }
  text(): string {
    return Buffer.concat(this.chunks).toString()
  }
}
