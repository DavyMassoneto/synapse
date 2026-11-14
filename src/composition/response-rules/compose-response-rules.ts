import {
  type ResponseRulesHost,
  registerResponseRules,
  responseRulesInstructionsPath,
} from "#synapse/integration/pi/response-rules"

export function composeResponseRules(pi: ResponseRulesHost): void {
  registerResponseRules(pi, responseRulesInstructionsPath())
}
