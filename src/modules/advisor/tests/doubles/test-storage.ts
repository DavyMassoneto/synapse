import {
  type ConfigLoadResult,
  type ConfigPort,
  type ConfigSaveResult,
  type ThinkingLevel,
} from "#synapse/modules/advisor"

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

  save(): ConfigSaveResult {
    this.saves += 1
    if (this.failSave) {
      return { kind: "failure", message: "disco indisponível" }
    }
    return { kind: "saved" }
  }
}
