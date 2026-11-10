import {
  type AdvisorResult,
  type Config,
  type ConfigLoadResult,
  type ConfigPort,
  parseModelReference,
  THINKING_LEVELS,
} from "#synapse/modules/advisor/public/contracts"
import { CONFIG_SAVE_FAILED, DEFAULT_THINKING, INVALID_MODEL, INVALID_THINKING } from "./constants"
import { type ConfigChange } from "./types"

export class AdvisorConfiguration {
  private readonly storage: ConfigPort
  private current: AdvisorResult

  constructor(storage: ConfigPort, loaded: ConfigLoadResult) {
    this.storage = storage
    const config: Config = { thinking: DEFAULT_THINKING }
    if (loaded.kind === "loaded" && loaded.config.thinking) {
      config.thinking = loaded.config.thinking
    }
    if (loaded.kind === "loaded" && loaded.config.model) {
      config.model = loaded.config.model
    }
    if (loaded.kind === "invalid") {
      this.current = { kind: "failure", message: loaded.message }
    } else {
      this.current = { kind: "success", config }
    }
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
    } catch (error) {
      if (error instanceof Error) {
        return { kind: "failure", message: `${CONFIG_SAVE_FAILED} Causa: ${error.message}` }
      }
      throw error
    }
  }

  private change(next: ConfigChange): AdvisorResult {
    if (this.current.kind === "failure") {
      return this.status()
    }
    return this.persist(next(this.current.config))
  }

  selectModel(model: string): AdvisorResult {
    if (parseModelReference(model).kind === "invalid") {
      return { kind: "failure", message: INVALID_MODEL }
    }
    return this.change((config) => ({ model, thinking: config.thinking }))
  }

  disable(): AdvisorResult {
    return this.change((config) => ({ thinking: config.thinking }))
  }

  setThinking(requested: string): AdvisorResult {
    const level = THINKING_LEVELS.find((candidate) => candidate === requested)
    if (!level) {
      return { kind: "failure", message: INVALID_THINKING }
    }
    return this.change((config) => ({ ...config, thinking: level }))
  }
}
