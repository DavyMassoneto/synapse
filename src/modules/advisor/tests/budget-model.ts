import type { ResolvedModel } from "../public";
import { TestModel } from "./test-model";

export class BudgetModel extends TestModel {
  constructor(private readonly descriptor: ResolvedModel) {
    super();
  }

  override async resolve(reference: string): Promise<ResolvedModel> {
    await super.resolve(reference);
    return this.descriptor;
  }
}
