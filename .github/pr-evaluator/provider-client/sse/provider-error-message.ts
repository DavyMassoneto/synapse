import { PROVIDER_ERROR_PREFIX, PROVIDER_ERROR_WITHOUT_MESSAGE } from "./constants"
import { type ProviderError } from "./types"

export function providerErrorMessage(error: ProviderError): string {
  if (typeof error.message === "string") {
    return `${PROVIDER_ERROR_PREFIX}: ${error.message}`
  }
  return PROVIDER_ERROR_WITHOUT_MESSAGE
}
