import { createAgentSession, getAgentDir, SettingsManager } from "@earendil-works/pi-coding-agent"
import { TeamMemberExtensionLifecycle, type TeamMemberExtensionSession } from "../extension-lifecycle"
import { TeamMemberResourceLoader } from "./resource-loader"
import { type TeamCreatedMemberSession, type TeamMemberSessionRequest } from "./types"

export async function createPiTeamMemberSession(request: TeamMemberSessionRequest): Promise<TeamCreatedMemberSession> {
  const agentDirectory = getAgentDir()
  const settings = SettingsManager.create(request.cwd, agentDirectory, { projectTrusted: request.projectTrusted })
  const loader = new TeamMemberResourceLoader({
    cwd: request.cwd,
    agentDirectory,
    settings,
    instructions: request.instructions,
  })
  await loader.reload()
  const { session, modelFallbackMessage } = await createAgentSession({
    cwd: request.cwd,
    settingsManager: settings,
    resourceLoader: loader,
    sessionManager: request.storage,
    model: request.selection.model,
    thinkingLevel: request.selection.thinkingLevel,
    customTools: request.tools,
  })
  const lifecycle = await startCreatedTeamMemberSession(session, modelFallbackMessage)
  return { session, lifecycle }
}

export async function startCreatedTeamMemberSession(
  session: TeamMemberExtensionSession,
  modelFallbackMessage?: string,
): Promise<TeamMemberExtensionLifecycle> {
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  if (modelFallbackMessage) {
    await lifecycle.start(new Error(modelFallbackMessage))
  } else {
    await lifecycle.start()
  }
  return lifecycle
}
