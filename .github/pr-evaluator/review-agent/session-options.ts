import { type CreateAgentSessionOptions, SessionManager, SettingsManager } from "@earendil-works/pi-coding-agent"
import { type ModelConfiguration } from "#evaluator/configuration"
import { READ_DIFF } from "#evaluator/output-page"
import { INSPECT_REPOSITORY } from "#evaluator/repository-inspection"
import { SUBMIT_REVIEW } from "#evaluator/review-result"
import { MODEL_NOT_REGISTERED, PROVIDER, SETTINGS, THINKING_LEVEL } from "./constants"
import { reviewModelRuntime } from "./model-runtime"
import { ReviewResources } from "./resources"
import { ReviewFailure } from "./review-failure"
import { type ReviewTools } from "./types"

export async function reviewSessionOptions(
  configuration: ModelConfiguration,
  tools: ReviewTools,
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
    tools: [INSPECT_REPOSITORY, READ_DIFF, SUBMIT_REVIEW],
    customTools: tools,
  }
}
