import { type ResolvedModel } from "../public"
import { TestModel } from "./test-model"

export class WaitingModel extends TestModel {
  private readonly gate: Promise<void>

  constructor(gate: Promise<void>) {
    super()
    this.gate = gate
  }

  override async resolve(reference: string): Promise<ResolvedModel> {
    const resolved = await super.resolve(reference)
    await this.gate
    return resolved
  }
}
