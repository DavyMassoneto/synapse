import { type ModelResolution } from "#synapse/modules/advisor/public"
import { TestModel } from "./test-model"

export class CancelOnResolveModel extends TestModel {
  private readonly controller: AbortController

  constructor(controller: AbortController) {
    super()
    this.controller = controller
  }

  override async resolve(reference: string): Promise<ModelResolution> {
    const resolved = await super.resolve(reference)
    this.controller.abort()
    return resolved
  }
}
