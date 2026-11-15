import { InMemoryCredentialStore } from "@earendil-works/pi-ai"
import {
  createAgentSession,
  DefaultResourceLoader,
  defineTool,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent"
import { leadTools, TEAM_TOOL_NO_PARAMETERS } from "#synapse/integration/pi/agent-team"
import { fixtureModel } from "../context"
import { TeamToolAccessModel } from "./tool-access-model"
import { TeamToolAccessProbe } from "./tool-access-probe"
import {
  TEAM_FIXTURE_ACCESS_API_KEY,
  TEAM_FIXTURE_ACCESS_CONTEXT_WINDOW,
  TEAM_FIXTURE_ACCESS_MODEL,
  TEAM_FIXTURE_ACCESS_PROVIDER,
  TEAM_FIXTURE_NESTED_TOOL,
  ToolsTeamDouble,
} from "./tools"

export async function createTeamToolAccessSession(directory: string, toolName: string) {
  const team = new ToolsTeamDouble()
  const tools = leadTools(team)
  const model = new TeamToolAccessModel(toolName)
  const probe = new TeamToolAccessProbe(tools)
  const settingsManager = SettingsManager.inMemory()
  const resourceLoader = new DefaultResourceLoader({
    cwd: directory,
    agentDir: directory,
    settingsManager,
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
  })
  await resourceLoader.reload()
  const modelRuntime = await ModelRuntime.create({
    credentials: new InMemoryCredentialStore(),
    modelsPath: null,
    refreshOnCreate: false,
  })
  await modelRuntime.setRuntimeApiKey(TEAM_FIXTURE_ACCESS_PROVIDER, TEAM_FIXTURE_ACCESS_API_KEY)
  const created = await createAgentSession({
    cwd: directory,
    agentDir: directory,
    settingsManager,
    resourceLoader,
    modelRuntime,
    sessionManager: SessionManager.inMemory(directory),
    noTools: "builtin",
    model: fixtureModel(TEAM_FIXTURE_ACCESS_PROVIDER, TEAM_FIXTURE_ACCESS_MODEL, TEAM_FIXTURE_ACCESS_CONTEXT_WINDOW),
    customTools: [
      ...tools,
      defineTool({
        name: TEAM_FIXTURE_NESTED_TOOL,
        label: TEAM_FIXTURE_NESTED_TOOL,
        description: TEAM_FIXTURE_NESTED_TOOL,
        parameters: TEAM_TOOL_NO_PARAMETERS,
        execute: probe.execute.bind(probe),
      }),
    ],
  })
  created.session.agent.streamFunction = model.stream.bind(model)
  return { session: created.session, probe, team }
}
