import { Value } from "typebox/value"
import { type ConfigLoadResult, parseModelReference } from "#synapse/modules/advisor/public/contracts"
import { CONFIG_INVALID, configSchema } from "./constants"

export function parseConfig(content: string): ConfigLoadResult {
  try {
    const config = Value.Parse(configSchema, JSON.parse(content))
    if (config.model && parseModelReference(config.model).kind === "invalid") {
      return { kind: "invalid", message: CONFIG_INVALID }
    }
    return { kind: "loaded", config }
  } catch {
    return { kind: "invalid", message: CONFIG_INVALID }
  }
}
