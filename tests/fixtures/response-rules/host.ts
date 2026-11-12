import { type ContextEvent } from "@earendil-works/pi-coding-agent"
import {
  type ResponseRulesContextHandler,
  type ResponseRulesContextOutcome,
  type ResponseRulesHost,
  type ResponseRulesUnsubscribe,
} from "#synapse/integration"
import { RESPONSE_RULES_TEST_HANDLER_MISSING } from "./constants"

export class ResponseRulesTestHost implements ResponseRulesHost {
  private handler?: ResponseRulesContextHandler

  on(_event: "context", handler: ResponseRulesContextHandler): ResponseRulesUnsubscribe {
    this.handler = handler
    return this.unsubscribe.bind(this)
  }

  private unsubscribe(): void {
    delete this.handler
  }

  emit(event: ContextEvent): ResponseRulesContextOutcome {
    if (this.handler) {
      return this.handler(event)
    }
    throw new Error(RESPONSE_RULES_TEST_HANDLER_MISSING)
  }
}
