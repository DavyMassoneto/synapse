import type { ConfigLoadResult, ConfigPort } from "../internal";
import type { ThinkingLevel } from "../public";

export class TestStorage implements ConfigPort {
  failSave = false;
  loads = 0;
  saves = 0;

  constructor(
    readonly model = "provider/model",
    readonly thinking: ThinkingLevel = "low",
  ) {}

  load(): ConfigLoadResult {
    this.loads += 1;
    return { kind: "loaded", config: { model: this.model, thinking: this.thinking } };
  }

  save(): void {
    this.saves += 1;
    if (this.failSave) {
      throw new Error("disco indisponível");
    }
  }
}
