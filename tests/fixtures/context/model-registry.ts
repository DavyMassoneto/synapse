import { type Api, type Context, type Model, type ModelsSimpleStreamOptions } from "@earendil-works/pi-ai"
import { type AdvisorModelRegistry } from "#synapse/integration"
import { assistantStream } from "./assistant-stream"
import { fixtureModel } from "./fixture-model"

export class RegistryFixture implements AdvisorModelRegistry {
  used?: Model<Api>
  options?: ModelsSimpleStreamOptions
  context?: Context
  window = 128_000
  missing = false
  authorized = true

  find(provider: string, id: string): ReturnType<AdvisorModelRegistry["find"]> {
    if (!this.missing) {
      return fixtureModel(provider, id, this.window)
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
