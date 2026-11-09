import { homedir } from "node:os"
import { join } from "node:path"
import { ADVISOR_CONFIG_SEGMENTS } from "./constants"

export function advisorConfigPath(): string {
  return join(homedir(), ...ADVISOR_CONFIG_SEGMENTS)
}
