import { type ExtensionAPI, type InputEventResult } from "@earendil-works/pi-coding-agent"
import { QUEUE_HANDLED, QUEUE_INPUT } from "./constants"

export class QueueHandledInput {
  handled = false

  register(api: ExtensionAPI): void {
    api.on(QUEUE_INPUT, this.handle.bind(this))
  }

  private handle(): InputEventResult {
    this.handled = true
    return { action: QUEUE_HANDLED }
  }
}
