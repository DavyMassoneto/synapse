import { type SynapseHost } from "#synapse/composition"
import {
  type AdvisorBeforeStartHandler,
  type AdvisorSessionStartHandler,
  type AdvisorShutdownHandler,
  type AdvisorTurnEndHandler,
  type CooldownMessageEndHandler,
  type ResponseRulesContextHandler,
  type Unsubscribe,
} from "#synapse/integration"
import { AdvisorHostCollector } from "../host"
import { type SynapseEventRegistration } from "./types"

export class SynapseHostCollector extends AdvisorHostCollector implements SynapseHost {
  readonly messageEnds: CooldownMessageEndHandler[] = []
  readonly contexts: ResponseRulesContextHandler[] = []

  on(event: "session_start", handler: AdvisorSessionStartHandler): Unsubscribe
  on(event: "session_shutdown", handler: AdvisorShutdownHandler): Unsubscribe
  on(event: "before_agent_start", handler: AdvisorBeforeStartHandler): Unsubscribe
  on(event: "turn_end", handler: AdvisorTurnEndHandler): Unsubscribe
  on(event: "message_end", handler: CooldownMessageEndHandler): Unsubscribe
  on(event: "context", handler: ResponseRulesContextHandler): Unsubscribe
  on(...registration: SynapseEventRegistration): Unsubscribe {
    switch (registration[0]) {
      case "message_end":
        this.messageEnds.push(registration[1])
        return this.unsubscribe
      case "context":
        this.contexts.push(registration[1])
        return this.unsubscribe
      default:
        return this.collect(registration)
    }
  }

  requireContextHandler(): ResponseRulesContextHandler {
    const [handler] = this.contexts
    if (handler) {
      return handler
    }
    throw new Error("handler de contexto ausente")
  }
}
