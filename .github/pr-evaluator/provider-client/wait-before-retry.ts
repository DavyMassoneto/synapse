import { setTimeout as delay } from "node:timers/promises"
import { RETRY_DELAY_MS } from "./constants"

export async function waitBeforeRetry(error: Error): Promise<void> {
  console.log(`Chamada ao modelo falhou (${error.message}); nova tentativa em ${RETRY_DELAY_MS} ms`)
  await delay(RETRY_DELAY_MS)
}
