import type { ResolvedModel } from "../public";
import { TestModel } from "./test-model";

export class WaitingModel extends TestModel {
  constructor(private readonly gate: Promise<void>) {
    super();
  }
  override async resolve(reference: string): Promise<ResolvedModel> {
    const resolved = await super.resolve(reference);
    await this.gate;
    return resolved;
  }
}
