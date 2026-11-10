import { Value } from "typebox/value"
import { PROVIDER_ERROR_PREFIX, PROVIDER_ERROR_WITHOUT_MESSAGE, StreamChunkSchema } from "./constants"
import { type ProviderError, type StreamChoice, type StreamResult } from "./types"

function providerErrorMessage(error: ProviderError): string {
  if (error.message) {
    return `${PROVIDER_ERROR_PREFIX}: ${error.message}`
  }
  return PROVIDER_ERROR_WITHOUT_MESSAGE
}

function applyChoice(result: StreamResult, choice: StreamChoice): void {
  if (choice.delta.content) {
    result.content += choice.delta.content
  }
  if (choice.finish_reason) {
    result.finishReason = choice.finish_reason
  }
}

export function applyPayload(result: StreamResult, payload: string): void {
  const chunk = Value.Parse(StreamChunkSchema, JSON.parse(payload))
  if (chunk.error) {
    throw new Error(providerErrorMessage(chunk.error))
  }
  if (chunk.choices) {
    for (const choice of chunk.choices) {
      applyChoice(result, choice)
    }
  }
}
