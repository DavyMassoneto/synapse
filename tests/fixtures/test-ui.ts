import type { AdvisorUI } from "#synapse/integration";

export class TestUI implements AdvisorUI {
  notices: string[] = [];
  selection: string | undefined;

  notify(message: string): void {
    this.notices.push(message);
  }

  async select(): Promise<string | undefined> {
    return this.selection;
  }

  setStatus(): void {}
}
