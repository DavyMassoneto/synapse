import { type Config } from "#synapse/modules"
import { COMMAND_TEXT } from "./constants"

export function currentModel(config: Config): string {
  if (config.model === undefined) {
    return COMMAND_TEXT.disabledStatus
  }
  return config.model
}
