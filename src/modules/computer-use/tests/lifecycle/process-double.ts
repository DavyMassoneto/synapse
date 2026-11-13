import { EventEmitter } from "node:events"
import { type ComputerStoppableProcess } from "#synapse/modules/computer-use/adapters/driver-process"

export class LifecycleProcess extends EventEmitter implements ComputerStoppableProcess {
  exitCode: ComputerStoppableProcess["exitCode"] = null

  signalCode: ComputerStoppableProcess["signalCode"] = null

  readonly signals: NodeJS.Signals[] = []

  kill(signal?: NodeJS.Signals): boolean {
    if (signal) {
      this.signals.push(signal)
    } else {
      this.signals.push("SIGTERM")
    }
    return true
  }

  close(): void {
    this.exitCode = 0
    this.emit("close", 0)
  }
}
