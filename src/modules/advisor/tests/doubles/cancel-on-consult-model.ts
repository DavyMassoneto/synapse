import { type ModelRequest, type ModelResponse, type ResolvedModel } from "#synapse/modules"
import { TestModel } from "./test-model"

export class CancelOnConsultModel extends TestModel {
  private readonly controller: AbortController

  constructor(controller: AbortController) {
    super()
    this.controller = controller
  }

  override async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    const response = await super.consult(resolved, request)
    this.controller.abort()
    return response
  }
}
