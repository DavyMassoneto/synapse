import { type ModelConfiguration } from "#evaluator/configuration"
import { MODEL_ATTEMPTS } from "./constants"
import { retryRequest } from "./retry-request"

export function callModel(configuration: ModelConfiguration, prompt: string): Promise<string> {
  return retryRequest(configuration, prompt, MODEL_ATTEMPTS - 1)
}
