import { type AdvisorResult } from "#synapse/modules"
import { type OptionalModel } from "../contracts"

export function configuredModel(result: AdvisorResult): OptionalModel {
  if (result.kind === "success") {
    return result.config.model
  }
  return undefined
}
