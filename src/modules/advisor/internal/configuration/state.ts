import {
  type AdvisorResult,
  type Config,
  isThinkingLevel,
  parseModelReference,
} from "#synapse/modules/advisor/public/contracts"
import { CONFIGURATION_DIAGNOSTICS } from "./constants"
import { initialConfiguration } from "./initialize"
import { type ConfigLoadResult, type ConfigPort } from "./types"

export class AdvisorConfiguration {
  private readonly config: ConfigPort
  private current: AdvisorResult

  constructor(config: ConfigPort, loaded: ConfigLoadResult) {
    this.config = config
    this.current = initialConfiguration(loaded)
  }

  status(): AdvisorResult {
    if (this.current.kind === "failure") {
      return { ...this.current }
    }
    return { kind: "success", config: { ...this.current.config } }
  }

  private persist(status: Config): AdvisorResult {
    try {
      this.config.save(status)
      this.current = { kind: "success", config: status }
      return this.status()
    } catch {
      return { kind: "failure", message: CONFIGURATION_DIAGNOSTICS.saveFailed }
    }
  }

  selectModel(model: string): AdvisorResult {
    if (!parseModelReference(model)) {
      return { kind: "failure", message: CONFIGURATION_DIAGNOSTICS.invalidModel }
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
    if (!isThinkingLevel(requested)) {
      return { kind: "failure", message: CONFIGURATION_DIAGNOSTICS.invalidThinking }
    }
    if (this.current.kind === "failure") {
      return this.status()
    }
    return this.persist({ ...this.current.config, thinking: requested })
  }
}
