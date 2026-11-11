import {
  type AdvisorResult,
  type Config,
  type ConfigLoadResult,
  type StoredConfig,
} from "#synapse/modules/advisor/public/contracts"
import { DEFAULT_THINKING } from "./constants"

function storedConfig(stored: StoredConfig): Config {
  const config: Config = { thinking: DEFAULT_THINKING }
  if (stored.thinking) {
    config.thinking = stored.thinking
  }
  if (stored.model) {
    config.model = stored.model
  }
  return config
}

export function initialState(loaded: ConfigLoadResult): AdvisorResult {
  switch (loaded.kind) {
    case "invalid":
      return { kind: "failure", message: loaded.message }
    case "missing":
      return { kind: "success", config: { thinking: DEFAULT_THINKING } }
    case "loaded":
      return { kind: "success", config: storedConfig(loaded.config) }
  }
}
