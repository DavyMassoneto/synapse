import { type AdvisorUI, type OptionalModel } from "#synapse/integration"

export class TestUI implements AdvisorUI {
  notices: string[] = []
  selection?: string

  notify(message: string): void {
    this.notices.push(message)
  }

  async select(): Promise<OptionalModel> {
    return this.selection
  }

  setStatus(): void {}
}
