import { type AgentMessage } from "@earendil-works/pi-agent-core"
import { type MessageEndEventResult } from "@earendil-works/pi-coding-agent"
import {
  COOLDOWN_MESSAGE_END,
  type CooldownMessageEndHandler,
  type CooldownRetryHost,
  type CooldownUnsubscribe,
} from "#synapse/integration"

export class CooldownRetryHostDouble implements CooldownRetryHost {
  private handler?: CooldownMessageEndHandler

  on(_event: "message_end", handler: CooldownMessageEndHandler): CooldownUnsubscribe {
    this.handler = handler
    return this.unsubscribe.bind(this)
  }

  unsubscribe(): void {
    delete this.handler
  }

  emitMessageEnd(message: AgentMessage): MessageEndEventResult {
    if (!this.handler) {
      throw new Error("handler de message_end ausente")
    }
    return this.handler({ type: COOLDOWN_MESSAGE_END, message })
  }
}
