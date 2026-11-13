import { Value } from "typebox/value"
import { type IphoneConfigurationChange } from "#synapse/modules"
import {
  PI_IPHONE_COMMAND_CONFIG,
  PI_IPHONE_COMMAND_INVALID_CHANGE,
  PI_IPHONE_COMMAND_QUOTE,
  PI_IPHONE_COMMAND_SETTING,
} from "./constants"
import { PI_IPHONE_COMMAND_VALUE_SCHEMA } from "./schemas"

export function iphoneConfigurationChanges(raw: string): IphoneConfigurationChange[] {
  const text = raw.trimEnd()
  const changes: IphoneConfigurationChange[] = []
  const pattern = new RegExp(PI_IPHONE_COMMAND_SETTING)
  let offset = raw.indexOf(PI_IPHONE_COMMAND_CONFIG) + PI_IPHONE_COMMAND_CONFIG.length
  while (offset < text.length) {
    pattern.lastIndex = offset
    const match = pattern.exec(text)
    if (!match) {
      throw new Error(PI_IPHONE_COMMAND_INVALID_CHANGE)
    }
    const key = match[1]
    const encoded = match[2]
    if (!key || !encoded) {
      throw new Error(PI_IPHONE_COMMAND_INVALID_CHANGE)
    }
    let value = encoded
    if (encoded.startsWith(PI_IPHONE_COMMAND_QUOTE)) {
      value = Value.Parse(PI_IPHONE_COMMAND_VALUE_SCHEMA, JSON.parse(encoded))
    }
    changes.push({ key, value })
    offset = pattern.lastIndex
  }
  return changes
}
