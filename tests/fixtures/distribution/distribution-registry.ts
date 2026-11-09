import { type Api, type Context, type Model, type ModelsSimpleStreamOptions } from "@earendil-works/pi-ai"
import { ModelRegistry, type ModelRuntime } from "@earendil-works/pi-coding-agent"
import { TestRegistry } from "../context"

export class DistributionRegistry extends ModelRegistry {
  readonly fake = new TestRegistry()

  constructor(runtime: ModelRuntime) {
    super(runtime)
  }
  override getAvailable(): Model<Api>[] {
    return this.fake.getAvailable()
  }
  override find(): Model<Api> {
    return this.fake.find()
  }
  override hasConfiguredAuth(): boolean {
    return true
  }
  override streamSimple(model: Model<Api>, context: Context, options?: ModelsSimpleStreamOptions) {
    return this.fake.streamSimple(model, context, options)
  }
}
