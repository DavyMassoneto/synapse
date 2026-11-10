import { type Config } from "#synapse/modules"
import { COMMAND_TEXT } from "./constants"

export function currentModel(config: Config): string {
  if (config.model) {
    return config.model
  }
  return COMMAND_TEXT.disabledStatus
}
