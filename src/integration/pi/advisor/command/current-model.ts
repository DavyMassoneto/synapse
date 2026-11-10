import { type Config } from "#synapse/modules"
import { DISABLED_STATUS } from "./constants"

export function currentModel(config: Config): string {
  if (config.model) {
    return config.model
  }
  return DISABLED_STATUS
}
