import { type ContextUI } from "./types"

export class TestUI implements ContextUI {
  notices: string[] = []
  selection?: string

  notify(message: string): void {
    this.notices.push(message)
  }

  async select(): ReturnType<ContextUI["select"]> {
    return this.selection
  }

  setStatus(): void {}
}
