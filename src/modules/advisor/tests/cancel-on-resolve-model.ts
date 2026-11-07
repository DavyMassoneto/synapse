import type { ResolvedModel } from "../public";
import { TestModel } from "./test-model";

export class CancelOnResolveModel extends TestModel {
  constructor(private readonly controller: AbortController) {
    super();
  }
  override async resolve(reference: string): Promise<ResolvedModel> {
    const resolved = await super.resolve(reference);
    this.controller.abort();
    return resolved;
  }
}
