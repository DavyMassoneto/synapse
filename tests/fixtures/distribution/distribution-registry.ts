import { type Api, type Context, type Model, type ModelsSimpleStreamOptions } from "@earendil-works/pi-ai"
import { ModelRegistry } from "@earendil-works/pi-coding-agent"
import { TestRegistry } from "../context"

export class DistributionRegistry extends ModelRegistry {
  readonly fake = new TestRegistry()

  override getAvailable(): Model<Api>[] {
    return this.fake.getAvailable()
  }
  override find(provider: string, id: string): ReturnType<ModelRegistry["find"]> {
    return this.fake.find(provider, id)
  }
  override hasConfiguredAuth(): boolean {
    return true
  }
  override streamSimple(model: Model<Api>, context: Context, options?: ModelsSimpleStreamOptions) {
    return this.fake.streamSimple(model, context, options)
  }
}
