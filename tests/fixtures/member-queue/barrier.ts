import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { QUEUE_INPUT, QUEUE_SETTLED } from "./constants"
import { type QueueBarrierEvent, type QueueBarrierRelease } from "./types"

export class QueueBarrier {
  entered = false

  private readonly event: QueueBarrierEvent

  private readonly gate: Promise<void>

  private resume?: QueueBarrierRelease

  constructor(event: QueueBarrierEvent) {
    this.event = event
    this.gate = new Promise<void>(this.capture.bind(this))
  }

  register(api: ExtensionAPI): void {
    switch (this.event) {
      case QUEUE_INPUT:
        api.on(QUEUE_INPUT, this.hold.bind(this))
        break
      case QUEUE_SETTLED:
        api.on(QUEUE_SETTLED, this.hold.bind(this))
        break
    }
  }

  release(): void {
    this.resume?.()
  }

  private capture(resolve: QueueBarrierRelease): void {
    this.resume = resolve
  }

  private async hold(): Promise<void> {
    if (!this.entered) {
      this.entered = true
      await this.gate
    }
  }
}
