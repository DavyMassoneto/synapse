import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { TEAM_PI_MEMBER_DIRECTORY } from "#synapse/integration/pi/agent-team"

export function admissionSessionFiles(agentDirectory: string, leadId: string): string[] {
  const directory = join(agentDirectory, TEAM_PI_MEMBER_DIRECTORY, leadId)
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory)
}
