import { ENV_MODEL_KEY, ENV_MODEL_NAME, ENV_MODEL_URL } from "./constants"
import { requireEnv } from "./environment"
import { type ModelConfiguration } from "./types"

export function readModelConfiguration(): ModelConfiguration {
  return {
    apiKey: requireEnv(ENV_MODEL_KEY),
    baseUrl: requireEnv(ENV_MODEL_URL),
    model: requireEnv(ENV_MODEL_NAME),
  }
}
