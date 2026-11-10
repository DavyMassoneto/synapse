import { type ModelConfiguration } from "#evaluator/configuration"
import { isRetryAllowed } from "./predicates"
import { reportRetry } from "./report-retry"
import { sendRequest } from "./send-request"
import { waitBeforeRetry } from "./wait-before-retry"

export async function retryRequest(
  configuration: ModelConfiguration,
  prompt: string,
  remaining: number,
): Promise<string> {
  try {
    return await sendRequest(configuration, prompt)
  } catch (error) {
    if (error instanceof Error && isRetryAllowed(error, remaining)) {
      reportRetry(error)
      await waitBeforeRetry()
      return retryRequest(configuration, prompt, remaining - 1)
    }
    throw error
  }
}
