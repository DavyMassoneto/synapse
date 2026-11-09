import { THINKING_LEVELS } from "./constants"
import { type Config, type ConfiguredConfig, type ThinkingLevel } from "./types"

export function isThinkingLevel(value: string): value is ThinkingLevel {
  return THINKING_LEVELS.some((level) => level === value)
}

export function hasModel(config: Config): config is ConfiguredConfig {
  return typeof config.model === "string" && config.model !== ""
}
