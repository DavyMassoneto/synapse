import { type ContextEvent } from "@earendil-works/pi-coding-agent"
import { applyResponseRulesReminder } from "./apply-reminder"
import { RESPONSE_RULES_APPLIED, RESPONSE_RULES_FOUND } from "./constants"
import { type ResponseRulesInstructions } from "./instructions"
import { extractResponseRulesSection } from "./response-rules-section"
import { type ResponseRulesContextOutcome } from "./types"

export class ResponseRulesContextEvents {
  private readonly rules: ResponseRulesInstructions

  constructor(rules: ResponseRulesInstructions) {
    this.rules = rules
  }

  handle(event: ContextEvent): ResponseRulesContextOutcome {
    const instructions = this.rules.readCurrent()
    if (instructions.kind === RESPONSE_RULES_FOUND) {
      const section = extractResponseRulesSection(instructions.text)
      if (section.kind === RESPONSE_RULES_FOUND) {
        const result = applyResponseRulesReminder(event.messages, section.text)
        if (result.kind === RESPONSE_RULES_APPLIED) {
          return { messages: result.messages }
        }
      }
    }
  }
}
