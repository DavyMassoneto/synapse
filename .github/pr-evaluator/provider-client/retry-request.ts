import { setTimeout as delay } from "node:timers/promises"
import { type ModelConfiguration } from "#evaluator/configuration"
import { RETRY_DELAY_MS } from "./constants"
import { isRetryable } from "./predicates"
import { sendRequest } from "./send-request"

export async function retryRequest(
  configuration: ModelConfiguration,
  prompt: string,
  remaining: number,
): Promise<string> {
  try {
    return await sendRequest(configuration, prompt)
  } catch (error) {
    if (remaining > 0 && error instanceof Error && isRetryable(error)) {
      console.log(`Chamada ao modelo falhou (${error.message}); nova tentativa em ${RETRY_DELAY_MS} ms`)
      await delay(RETRY_DELAY_MS)
      return retryRequest(configuration, prompt, remaining - 1)
    }
    throw error
  }
}
