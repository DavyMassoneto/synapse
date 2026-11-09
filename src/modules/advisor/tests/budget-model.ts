import { type ResolvedModel } from "../public"
import { TestModel } from "./test-model"

export class BudgetModel extends TestModel {
  private readonly descriptor: ResolvedModel

  constructor(descriptor: ResolvedModel) {
    super()
    this.descriptor = descriptor
  }

  override async resolve(reference: string): Promise<ResolvedModel> {
    await super.resolve(reference)
    return this.descriptor
  }
}
