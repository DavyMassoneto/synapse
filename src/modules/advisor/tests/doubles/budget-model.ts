import { type ModelResolution, type ResolvedModel } from "#synapse/modules/advisor"
import { TestModel } from "./test-model"

export class BudgetModel extends TestModel {
  private readonly descriptor: ResolvedModel

  constructor(descriptor: ResolvedModel) {
    super()
    this.descriptor = descriptor
  }

  override async resolve(reference: string): Promise<ModelResolution> {
    await super.resolve(reference)
    return { kind: "resolved", model: this.descriptor }
  }
}
