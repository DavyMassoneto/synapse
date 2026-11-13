import {
  COMPUTER_PROCESS_CLOSE_EVENT,
  COMPUTER_PROCESS_FORCE_KILL_SIGNAL,
  COMPUTER_PROCESS_STOP_GRACE_MILLISECONDS,
} from "./constants"
import { type ComputerProcessCloseResolver, type ComputerStoppableProcess } from "./types"

export class ComputerProcessTermination {
  private readonly child: ComputerStoppableProcess

  private closed = false

  private resolveClose?: ComputerProcessCloseResolver

  private readonly closing = new Promise<void>(this.registerClose.bind(this))

  constructor(child: ComputerStoppableProcess) {
    this.child = child
    child.once(COMPUTER_PROCESS_CLOSE_EVENT, this.onClose.bind(this))
  }

  private registerClose(resolve: ComputerProcessCloseResolver): void {
    this.resolveClose = resolve
  }

  private onClose(): void {
    this.closed = true
    this.resolveClose?.()
  }

  async stop(): Promise<void> {
    if (!this.closed) {
      const timer = setTimeout(
        this.child.kill.bind(this.child, COMPUTER_PROCESS_FORCE_KILL_SIGNAL),
        COMPUTER_PROCESS_STOP_GRACE_MILLISECONDS,
      )
      try {
        this.child.kill()
        await this.closing
      } finally {
        clearTimeout(timer)
      }
    }
  }
}
