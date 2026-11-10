import {
  type AdvisorResult,
  type Config,
  type ConfigLoadResult,
  type ConfigPort,
  parseModelReference,
  THINKING_LEVELS,
} from "#synapse/modules/advisor/public/contracts"
import { CONFIG_SAVE_FAILED, INVALID_MODEL, INVALID_THINKING } from "./constants"
import { initialConfiguration } from "./initialize"

export class AdvisorConfiguration {
  private readonly storage: ConfigPort
  private current: AdvisorResult

  constructor(storage: ConfigPort, loaded: ConfigLoadResult) {
    this.storage = storage
    this.current = initialConfiguration(loaded)
  }

  status(): AdvisorResult {
    if (this.current.kind === "failure") {
      return { ...this.current }
    }
    return { kind: "success", config: { ...this.current.config } }
  }

  private persist(config: Config): AdvisorResult {
    try {
      this.storage.save(config)
      this.current = { kind: "success", config }
      return this.status()
    } catch {
      return { kind: "failure", message: CONFIG_SAVE_FAILED }
    }
  }

  selectModel(model: string): AdvisorResult {
    if (parseModelReference(model).kind === "invalid") {
      return { kind: "failure", message: INVALID_MODEL }
    }
    if (this.current.kind === "failure") {
      return this.status()
    }
    return this.persist({ model, thinking: this.current.config.thinking })
  }

  disable(): AdvisorResult {
    if (this.current.kind === "failure") {
      return this.status()
    }
    return this.persist({ thinking: this.current.config.thinking })
  }

  setThinking(requested: string): AdvisorResult {
    const level = THINKING_LEVELS.find((candidate) => candidate === requested)
    if (!level) {
      return { kind: "failure", message: INVALID_THINKING }
    }
    if (this.current.kind === "failure") {
      return this.status()
    }
    return this.persist({ ...this.current.config, thinking: level })
  }
}
