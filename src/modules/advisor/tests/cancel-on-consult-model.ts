import type { ModelRequest, ModelResponse, ResolvedModel } from "../public";
import { TestModel } from "./test-model";

export class CancelOnConsultModel extends TestModel {
  constructor(private readonly controller: AbortController) {
    super();
  }
  override async consult(resolved: ResolvedModel, request: ModelRequest): Promise<ModelResponse> {
    const response = await super.consult(resolved, request);
    this.controller.abort();
    return response;
  }
}
