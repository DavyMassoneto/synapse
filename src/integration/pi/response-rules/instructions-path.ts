import { join } from "node:path"
import { getAgentDir } from "@earendil-works/pi-coding-agent"
import { RESPONSE_RULES_INSTRUCTIONS_FILE } from "./constants"

export function responseRulesInstructionsPath(): string {
  return join(getAgentDir(), RESPONSE_RULES_INSTRUCTIONS_FILE)
}
