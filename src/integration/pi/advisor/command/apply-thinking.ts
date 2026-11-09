import { type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { type AdvisorToolActivation } from "../lifecycle"
import { reportResult } from "./report-result"

export function applyThinking(
  pi: AdvisorToolActivation,
  advisor: Advisor,
  context: AdvisorContext,
  level: string,
): void {
  reportResult(pi, advisor, context, advisor.configuration.setThinking(level), `Advisor thinking: ${level}`)
}
