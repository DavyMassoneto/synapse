import { setTimeout as delay } from "node:timers/promises"
import { type ModelConfiguration } from "#evaluator/configuration"
import { RETRY_DELAY_MS } from "./constants"
import { isRetryable } from "./predicates"
import { sendRequest } from "./send-request"

export async function callModel(configuration: ModelConfiguration, prompt: string): Promise<string> {
  try {
    return await sendRequest(configuration, prompt)
  } catch (error) {
    if (error instanceof Error && isRetryable(error)) {
      console.log(`Chamada ao modelo falhou (${error.message}); nova tentativa em ${RETRY_DELAY_MS} ms`)
      await delay(RETRY_DELAY_MS)
      return sendRequest(configuration, prompt)
    }
    throw error
  }
}
