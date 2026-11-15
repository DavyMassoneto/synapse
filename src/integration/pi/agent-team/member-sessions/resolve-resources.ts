import { DefaultPackageManager } from "@earendil-works/pi-coding-agent"
import { TEAM_PI_MEMBER_EXTENSION_FAILURE } from "../extension-lifecycle"
import { type TeamMemberResourceRequest, type TeamMemberResources } from "./types"

export async function resolveMemberResources(request: TeamMemberResourceRequest): Promise<TeamMemberResources> {
  await request.settings.reload()
  const manager = new DefaultPackageManager({
    cwd: request.cwd,
    agentDir: request.agentDirectory,
    settingsManager: request.settings,
  })
  const resources = await manager.resolve()
  if (resources.installFailures?.length) {
    throw new Error(TEAM_PI_MEMBER_EXTENSION_FAILURE + JSON.stringify(resources.installFailures))
  }
  return resources
}
