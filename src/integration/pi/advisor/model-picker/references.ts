import { REFERENCE_SEPARATOR } from "#synapse/modules"
import { type AdvisorContext } from "../host-contracts"
import { type ListedModel } from "./types"

function listedModels(context: AdvisorContext): ListedModel[] {
  if (context.scopedModels.length > 0) {
    return context.scopedModels.map((entry) => entry.model)
  }
  return context.modelRegistry.getAvailable()
}

export function modelReferences(context: AdvisorContext): string[] {
  return listedModels(context).map((model) => `${model.provider}${REFERENCE_SEPARATOR}${model.id}`)
}
