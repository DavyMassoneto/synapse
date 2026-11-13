import {
  COMPUTER_DRIVER_DISCONNECTED,
  COMPUTER_DRIVER_INVALID,
  COMPUTER_DRIVER_TIMEOUT,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_PROCESS_DISCONNECTED_MESSAGE, COMPUTER_PROCESS_TIMEOUT_MESSAGE } from "./constants"
import { type ComputerProcessPendingCall, type ComputerProcessResolver, type ComputerProcessRpcResult } from "./types"

export class ComputerProcessPendingCalls {
  private readonly pending = new Map<number, ComputerProcessPendingCall>()

  add(id: number, timeoutMilliseconds: number, resolve: ComputerProcessResolver): void {
    const timer = setTimeout(this.timeout.bind(this, id), timeoutMilliseconds)
    this.pending.set(id, { resolve, timer })
  }

  settle(id: number, result: ComputerProcessRpcResult): void {
    const pending = this.pending.get(id)
    if (pending) {
      clearTimeout(pending.timer)
      this.pending.delete(id)
      pending.resolve(result)
    }
  }

  invalidate(message: string): void {
    for (const id of this.pending.keys()) {
      this.settle(id, { kind: COMPUTER_DRIVER_INVALID, message })
    }
  }

  disconnect(): void {
    for (const id of this.pending.keys()) {
      this.settle(id, { kind: COMPUTER_DRIVER_DISCONNECTED, message: COMPUTER_PROCESS_DISCONNECTED_MESSAGE })
    }
  }

  private timeout(id: number): void {
    this.settle(id, { kind: COMPUTER_DRIVER_TIMEOUT, message: COMPUTER_PROCESS_TIMEOUT_MESSAGE })
  }
}
