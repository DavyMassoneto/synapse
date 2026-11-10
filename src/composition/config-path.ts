import { homedir } from "node:os"
import { join } from "node:path"

export function advisorConfigPath(): string {
  return join(homedir(), ".pi", "agent", "advisor.json")
}
