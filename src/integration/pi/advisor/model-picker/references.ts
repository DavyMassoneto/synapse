import { REFERENCE_SEPARATOR } from "#synapse/modules"
import { type ListedModel, type PickerContext } from "./types"

function listedModels(context: PickerContext): ListedModel[] {
  if (context.scopedModels.length > 0) {
    return context.scopedModels.map((entry) => entry.model)
  }
  return context.modelRegistry.getAvailable()
}

export function modelReferences(context: PickerContext): string[] {
  return listedModels(context).map((model) => `${model.provider}${REFERENCE_SEPARATOR}${model.id}`)
}
