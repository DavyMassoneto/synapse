import { type Api, type Context, type Model, type ModelsSimpleStreamOptions } from "@earendil-works/pi-ai"
import { type AdvisorRegistry } from "#synapse/integration"
import { assistantStream } from "./assistant-stream"
import { type TestStopReason } from "./types"

export class TestRegistry implements AdvisorRegistry {
  calls = 0
  stopReason: TestStopReason = "stop"
  readonly model: Model<Api> = {
    provider: "provider",
    id: "model",
    name: "model",
    api: "anthropic-messages",
    baseUrl: "https://example.invalid",
    input: ["text"],
    contextWindow: 40_000,
    maxTokens: 32_000,
    reasoning: true,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  }

  getAvailable(): Model<Api>[] {
    return [
      this.model,
      { ...this.model, id: "other", name: "other" },
      { ...this.model, id: "thinkingx", name: "thinkingx" },
    ]
  }
  find(): Model<Api> {
    this.calls += 1
    return this.model
  }
  hasConfiguredAuth(): boolean {
    return true
  }
  streamSimple(_model: Model<Api>, _context: Context, _options?: ModelsSimpleStreamOptions) {
    return assistantStream("model", "conselho", this.stopReason)
  }
}
