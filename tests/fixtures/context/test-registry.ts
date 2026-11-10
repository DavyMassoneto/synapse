import { type Api, type Context, type Model, type ModelsSimpleStreamOptions } from "@earendil-works/pi-ai"
import { type AdvisorRegistry } from "#synapse/integration"
import { assistantStream } from "./assistant-stream"
import { fixtureModel } from "./fixture-model"
import { type TestStopReason } from "./types"

export class TestRegistry implements AdvisorRegistry {
  calls = 0
  stopReason: TestStopReason = "stop"
  window = 40_000
  missing = false
  authorized = true
  used?: Model<Api>
  options?: ModelsSimpleStreamOptions
  context?: Context
  readonly model = fixtureModel("provider", "model", 40_000)

  getAvailable(): Model<Api>[] {
    return [
      this.model,
      { ...this.model, id: "other", name: "other" },
      { ...this.model, id: "thinkingx", name: "thinkingx" },
    ]
  }

  find(provider: string, id: string): ReturnType<AdvisorRegistry["find"]> {
    this.calls += 1
    if (!this.missing) {
      return fixtureModel(provider, id, this.window)
    }
  }

  hasConfiguredAuth(): boolean {
    return this.authorized
  }

  streamSimple(model: Model<Api>, context: Context, options?: ModelsSimpleStreamOptions) {
    this.used = model
    this.context = context
    if (options) {
      this.options = options
    }
    return assistantStream(model.id, "conselho", this.stopReason)
  }
}
