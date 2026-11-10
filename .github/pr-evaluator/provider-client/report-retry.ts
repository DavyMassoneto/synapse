import { RETRY_DELAY_MS } from "./constants"

export function reportRetry(error: Error): void {
  console.log(`Chamada ao modelo falhou (${error.message}); nova tentativa em ${RETRY_DELAY_MS} ms`)
}
