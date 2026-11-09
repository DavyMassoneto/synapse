import { type ModelConfiguration } from "#evaluator/configuration"
import { MAX_OUTPUT_TOKENS } from "./constants"

export function buildRequestBody(configuration: ModelConfiguration, prompt: string): string {
  return JSON.stringify({
    model: configuration.model,
    stream: true,
    temperature: 0,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [{ role: "user", content: prompt }],
  })
}
