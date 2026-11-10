import { type ModelRequest, type ModelResponse, type ResolvedModel } from "#synapse/modules"
import { TestModel } from "./test-model"

export class CancelledModel extends TestModel {
  override async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    await super.consult(resolved, request)
    return { kind: "cancelled" }
  }
}
