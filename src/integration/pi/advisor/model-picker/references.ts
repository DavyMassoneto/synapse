import { REFERENCE_SEPARATOR } from "#synapse/modules"
import { type ListedModel, type PickerContext } from "./types"

function* listedModels(context: PickerContext): Generator<ListedModel> {
  if (context.scopedModels.length > 0) {
    for (const entry of context.scopedModels) {
      yield entry.model
    }
  } else {
    yield* context.modelRegistry.getAvailable()
  }
}

export function modelReferences(context: PickerContext): string[] {
  return Array.from(listedModels(context), (model) => `${model.provider}${REFERENCE_SEPARATOR}${model.id}`)
}
