import { type Api, type Model } from "@earendil-works/pi-ai"
import { FIXTURE_MODEL_API, FIXTURE_MODEL_MAX_TOKENS, FIXTURE_MODEL_URL } from "./constants"

export function fixtureModel(provider: string, id: string, contextWindow: number): Model<Api> {
  return {
    provider,
    id,
    name: id,
    api: FIXTURE_MODEL_API,
    baseUrl: FIXTURE_MODEL_URL,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    reasoning: true,
    contextWindow,
    maxTokens: FIXTURE_MODEL_MAX_TOKENS,
  }
}
