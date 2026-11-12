import { type IphoneConfigurationChange } from "#synapse/modules"
import { PI_IPHONE_COMMAND_ASSIGNMENT, PI_IPHONE_COMMAND_INVALID_CHANGE, PI_IPHONE_COMMAND_WORDS } from "./constants"

export function iphoneConfigurationChanges(raw: string): IphoneConfigurationChange[] {
  const words = raw.trim().split(PI_IPHONE_COMMAND_WORDS)
  const changes: IphoneConfigurationChange[] = []
  for (const word of words.slice(1)) {
    const separator = word.indexOf(PI_IPHONE_COMMAND_ASSIGNMENT)
    if (separator < 1) {
      throw new Error(PI_IPHONE_COMMAND_INVALID_CHANGE)
    }
    changes.push({ key: word.slice(0, separator), value: word.slice(separator + 1) })
  }
  return changes
}
