import { type AdvisorResult, type Config } from "#synapse/modules/advisor/public/contracts"
import { DEFAULT_THINKING } from "./constants"
import { type ConfigLoadResult, type StoredConfig } from "./types"

function storedConfiguration(stored: StoredConfig): Config {
  const config: Config = { thinking: DEFAULT_THINKING }
  if (stored.thinking) {
    config.thinking = stored.thinking
  }
  if (stored.model) {
    config.model = stored.model
  }
  return config
}

export function initialConfiguration(loaded: ConfigLoadResult): AdvisorResult {
  if (loaded.kind === "invalid") {
    return { kind: "failure", message: loaded.message }
  }
  if (loaded.kind === "loaded") {
    return { kind: "success", config: storedConfiguration(loaded.config) }
  }
  return { kind: "success", config: storedConfiguration({}) }
}
