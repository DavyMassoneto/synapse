import { type ModelResponse } from "#synapse/modules/advisor/public"
import { TestModel } from "./test-model"

export class FailingModel extends TestModel {
  override async consult(): Promise<ModelResponse> {
    return { kind: "failure", message: "provider error" }
  }
}
