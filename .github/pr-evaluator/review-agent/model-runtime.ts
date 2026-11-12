import { InMemoryCredentialStore, InMemoryModelsStore } from "@earendil-works/pi-ai"
import { ModelRuntime } from "@earendil-works/pi-coding-agent"
import { type ModelConfiguration } from "#evaluator/configuration"
import {
  CACHE_HEADERS,
  MAX_OUTPUT_TOKENS,
  MODEL_API,
  MODEL_CONTEXT_TOKENS,
  MODEL_COST,
  MODEL_INPUT,
  PROVIDER,
} from "./constants"

export async function reviewModelRuntime(configuration: ModelConfiguration): Promise<ModelRuntime> {
  const runtime = await ModelRuntime.create({
    credentials: new InMemoryCredentialStore(),
    modelsPath: null,
    modelsStore: new InMemoryModelsStore(),
    refreshOnCreate: false,
  })
  runtime.registerProvider(PROVIDER, {
    baseUrl: configuration.baseUrl,
    api: MODEL_API,
    headers: { ...CACHE_HEADERS },
    models: [
      {
        id: configuration.model,
        name: configuration.model,
        reasoning: false,
        input: MODEL_INPUT,
        cost: MODEL_COST,
        contextWindow: MODEL_CONTEXT_TOKENS,
        maxTokens: MAX_OUTPUT_TOKENS,
      },
    ],
  })
  await runtime.setRuntimeApiKey(PROVIDER, configuration.apiKey)
  return runtime
}
