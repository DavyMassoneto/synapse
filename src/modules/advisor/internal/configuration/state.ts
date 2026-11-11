import {
  type AdvisorResult,
  type Config,
  type ConfigLoadResult,
  type ConfigPort,
  parseModelReference,
  THINKING_LEVELS,
} from "#synapse/modules/advisor/public/contracts"
import { CONFIG_SAVE_FAILED, INVALID_MODEL, INVALID_THINKING, SAVE_FAILURE_CAUSE } from "./constants"
import { initialState } from "./initial-state"
import { type ConfigChange } from "./types"

export class AdvisorConfiguration {
  private readonly $storage: ConfigPort
  private $current: AdvisorResult

  constructor(storage: ConfigPort, loaded: ConfigLoadResult) {
    this.$storage = storage
    this.$current = initialState(loaded)
  }

  status(): AdvisorResult {
    if (this.$current.kind === "failure") {
      return { ...this.$current }
    }
    return { kind: "success", config: { ...this.$current.config } }
  }

  private $persist(config: Config): AdvisorResult {
    const saved = this.$storage.save(config)
    if (saved.kind === "failure") {
      return { kind: "failure", message: `${CONFIG_SAVE_FAILED}${SAVE_FAILURE_CAUSE}${saved.message}` }
    }
    this.$current = { kind: "success", config }
    return this.status()
  }

  private $change(next: ConfigChange): AdvisorResult {
    if (this.$current.kind === "failure") {
      return this.status()
    }
    return this.$persist(next(this.$current.config))
  }

  selectModel(model: string): AdvisorResult {
    if (parseModelReference(model).kind === "invalid") {
      return { kind: "failure", message: INVALID_MODEL }
    }
    return this.$change((config) => ({ model, thinking: config.thinking }))
  }

  disable(): AdvisorResult {
    return this.$change((config) => ({ thinking: config.thinking }))
  }

  setThinking(requested: string): AdvisorResult {
    const level = THINKING_LEVELS.find((candidate) => candidate === requested)
    if (!level) {
      return { kind: "failure", message: INVALID_THINKING }
    }
    return this.$change((config) => ({ ...config, thinking: level }))
  }
}
