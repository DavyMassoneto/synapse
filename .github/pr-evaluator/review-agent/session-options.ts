import { type CreateAgentSessionOptions, SessionManager, SettingsManager } from "@earendil-works/pi-coding-agent"
import { type ModelConfiguration } from "#evaluator/configuration"
import { MODEL_NOT_REGISTERED, PROVIDER, SETTINGS, THINKING_LEVEL } from "./constants"
import { reviewModelRuntime } from "./model-runtime"
import { ReviewResources } from "./resources"
import { ReviewFailure } from "./review-failure"

export async function reviewSessionOptions(
  configuration: ModelConfiguration,
  tools: NonNullable<CreateAgentSessionOptions["customTools"]>,
): Promise<CreateAgentSessionOptions> {
  const runtime = await reviewModelRuntime(configuration)
  const model = runtime.getModel(PROVIDER, configuration.model)
  if (!model) {
    throw new ReviewFailure(MODEL_NOT_REGISTERED)
  }
  return {
    cwd: process.cwd(),
    model,
    modelRuntime: runtime,
    thinkingLevel: THINKING_LEVEL,
    settingsManager: SettingsManager.inMemory(SETTINGS),
    sessionManager: SessionManager.inMemory(),
    resourceLoader: new ReviewResources(),
    tools: tools.map(toolName),
    customTools: tools,
  }
}

function toolName(tool: NonNullable<CreateAgentSessionOptions["customTools"]>[number]): string {
  return tool.name
}
