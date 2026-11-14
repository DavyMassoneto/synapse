import { type ResponseRulesHost, registerResponseRules, responseRulesInstructionsPath } from "#synapse/integration"

export function composeResponseRules(pi: ResponseRulesHost): void {
  registerResponseRules(pi, responseRulesInstructionsPath())
}
