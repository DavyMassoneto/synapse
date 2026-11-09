import { type ConfigLoadResult, type ConfigPort } from "#synapse/modules/advisor/internal"
import { type ThinkingLevel } from "#synapse/modules/advisor/public"

export class TestStorage implements ConfigPort {
  failSave = false
  loads = 0
  saves = 0
  model = "provider/model"
  thinking: ThinkingLevel = "low"

  load(): ConfigLoadResult {
    this.loads += 1
    return { kind: "loaded", config: { model: this.model, thinking: this.thinking } }
  }

  save(): void {
    this.saves += 1
    if (this.failSave) {
      throw new Error("disco indisponível")
    }
  }
}
