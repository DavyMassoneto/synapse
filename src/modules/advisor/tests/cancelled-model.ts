import type { ModelRequest, ModelResponse, ResolvedModel } from "../public";
import { TestModel } from "./test-model";

export class CancelledModel extends TestModel {
  override async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    await super.consult(resolved, request);
    return { kind: "cancelled" };
  }
}
