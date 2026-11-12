import { join } from "node:path"
import { getAgentDir } from "@earendil-works/pi-coding-agent"
import { ADVISOR_CONFIG_FILE } from "./constants"

export function advisorConfigPath(): string {
  return join(getAgentDir(), ADVISOR_CONFIG_FILE)
}
