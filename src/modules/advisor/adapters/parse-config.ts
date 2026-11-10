import { Value } from "typebox/value"
import { type ConfigLoadResult } from "#synapse/modules/advisor/public/contracts"
import { CONFIG_INVALID, configSchema } from "./constants"

export function parseConfig(content: string): ConfigLoadResult {
  try {
    return { kind: "loaded", config: Value.Parse(configSchema, JSON.parse(content)) }
  } catch {
    return { kind: "invalid", message: CONFIG_INVALID }
  }
}
