import { InMemoryCredentialStore } from "@earendil-works/pi-ai"
import {
  createBashToolDefinition,
  DefaultResourceLoader,
  defineTool,
  ModelRuntime,
  type SettingsManager,
  type ToolDefinition,
} from "@earendil-works/pi-coding-agent"
import { memberTools, SupervisedBashOperations } from "#synapse/integration/pi/agent-team"
import { type AgentTeam, type SupervisedShellService } from "#synapse/modules/agent-team"
import { WATCHDOG_API_KEY, WATCHDOG_PROVIDER } from "./constants"

export async function prepareWatchdogResources(
  directory: string,
  settings: SettingsManager,
): Promise<DefaultResourceLoader> {
  const loader = new DefaultResourceLoader({
    cwd: directory,
    agentDir: directory,
    settingsManager: settings,
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
  })
  await loader.reload()
  return loader
}

export async function prepareWatchdogRuntime(): Promise<ModelRuntime> {
  const runtime = await ModelRuntime.create({
    credentials: new InMemoryCredentialStore(),
    modelsPath: null,
    refreshOnCreate: false,
  })
  await runtime.setRuntimeApiKey(WATCHDOG_PROVIDER, WATCHDOG_API_KEY)
  return runtime
}

export function prepareWatchdogTools(
  directory: string,
  shell: SupervisedShellService,
  name: string,
  team?: AgentTeam,
): ToolDefinition[] {
  const tool = defineTool(createBashToolDefinition(directory, { operations: new SupervisedBashOperations(shell) }))
  const tools: ToolDefinition[] = [tool]
  if (team) {
    tools.push(...memberTools(team, name))
  }
  return tools
}
