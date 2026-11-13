import { RESPONSE_RULES_CONTEXT_EVENT } from "./constants"
import { ResponseRulesContextEvents } from "./context-handler"
import { ResponseRulesInstructions } from "./instructions"
import { type ResponseRulesHost } from "./types"

export function registerResponseRules(pi: ResponseRulesHost, instructionsPath: string): void {
  const handler = new ResponseRulesContextEvents(new ResponseRulesInstructions(instructionsPath))
  pi.on(RESPONSE_RULES_CONTEXT_EVENT, handler.handle.bind(handler))
}
