import { type Config, hasModel } from "#synapse/modules"
import { COMMAND_TEXT } from "./constants"

export function currentModel(config: Config): string {
  if (hasModel(config)) {
    return config.model
  }
  return COMMAND_TEXT.disabledStatus
}
