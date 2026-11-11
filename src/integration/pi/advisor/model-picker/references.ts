import { REFERENCE_SEPARATOR } from "#synapse/modules"
import { type PickerContext } from "./types"

export function modelReferences(context: PickerContext): string[] {
  if (context.scopedModels.length > 0) {
    return context.scopedModels.map((entry) => `${entry.model.provider}${REFERENCE_SEPARATOR}${entry.model.id}`)
  }
  return context.modelRegistry.getAvailable().map((model) => `${model.provider}${REFERENCE_SEPARATOR}${model.id}`)
}
