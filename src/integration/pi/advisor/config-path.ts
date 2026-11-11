import { homedir } from "node:os"
import { join } from "node:path"
import { ADVISOR_CONFIG_FILE, AGENT_DIRECTORY, PI_DIRECTORY } from "./constants"

export function advisorConfigPath(): string {
  return join(homedir(), PI_DIRECTORY, AGENT_DIRECTORY, ADVISOR_CONFIG_FILE)
}
