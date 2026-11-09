import { type AdvisorUI } from "#synapse/integration"

export class TestUI implements AdvisorUI {
  notices: string[] = []
  selection?: string

  notify(message: string): void {
    this.notices.push(message)
  }

  async select(): ReturnType<AdvisorUI["select"]> {
    return this.selection
  }

  setStatus(): void {}
}
