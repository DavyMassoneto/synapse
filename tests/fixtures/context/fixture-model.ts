import { type Api, type Model } from "@earendil-works/pi-ai"

export function fixtureModel(provider: string, id: string, contextWindow: number): Model<Api> {
  return {
    provider,
    id,
    name: id,
    api: "anthropic-messages",
    baseUrl: "https://example.invalid",
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    reasoning: true,
    contextWindow,
    maxTokens: 32_000,
  }
}
