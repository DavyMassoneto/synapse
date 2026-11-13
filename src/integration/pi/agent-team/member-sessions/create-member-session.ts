import { createAgentSession, DefaultResourceLoader, getAgentDir } from "@earendil-works/pi-coding-agent"
import { TEAM_PI_MEMBER_EXTENSION_FAILURE, TeamMemberExtensionLifecycle } from "../extension-lifecycle"
import { type TeamCreatedMemberSession, type TeamMemberSessionRequest } from "./types"

export async function createPiTeamMemberSession(request: TeamMemberSessionRequest): Promise<TeamCreatedMemberSession> {
  const loader = await createTeamResourceLoader(request)
  const { session, modelFallbackMessage } = await createAgentSession({
    cwd: request.cwd,
    resourceLoader: loader,
    sessionManager: request.storage,
    model: request.selection.model,
    thinkingLevel: request.selection.thinkingLevel,
    customTools: request.tools,
  })
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  try {
    if (modelFallbackMessage) {
      throw new Error(modelFallbackMessage)
    }
    await lifecycle.start()
    return { session, lifecycle }
  } catch (error) {
    try {
      await lifecycle.close()
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], TEAM_PI_MEMBER_EXTENSION_FAILURE)
    }
    throw error
  }
}

async function createTeamResourceLoader(request: TeamMemberSessionRequest): Promise<DefaultResourceLoader> {
  const loader = new DefaultResourceLoader({
    cwd: request.cwd,
    agentDir: getAgentDir(),
    noExtensions: true,
    extensionFactories: [request.extension],
    additionalExtensionPaths: request.extensionPaths,
    appendSystemPrompt: [request.instructions],
  })
  await loader.reload()
  const errors = loader.getExtensions().errors
  if (errors.length > 0) {
    throw new Error(TEAM_PI_MEMBER_EXTENSION_FAILURE + JSON.stringify(errors))
  }
  return loader
}
