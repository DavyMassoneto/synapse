import { type Api, type Context, type Model, type ModelsSimpleStreamOptions } from "@earendil-works/pi-ai"
import { type AdvisorModelRegistry } from "#synapse/integration"
import { assistantStream } from "./assistant-stream"

export class RegistryFixture implements AdvisorModelRegistry {
  used?: Model<Api>
  options?: ModelsSimpleStreamOptions
  context?: Context
  window = 128_000
  missing = false
  authorized = true

  find(provider: string, id: string): ReturnType<AdvisorModelRegistry["find"]> {
    if (!this.missing) {
      return {
        provider,
        id,
        name: id,
        api: "anthropic-messages",
        baseUrl: "https://example.invalid",
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        reasoning: true,
        contextWindow: this.window,
        maxTokens: 32_000,
      }
    }
  }

  hasConfiguredAuth(): boolean {
    return this.authorized
  }

  streamSimple(model: Model<Api>, context: Context, options: ModelsSimpleStreamOptions) {
    this.used = model
    this.context = context
    this.options = options
    return assistantStream(model.id, "ok", "stop")
  }
}
