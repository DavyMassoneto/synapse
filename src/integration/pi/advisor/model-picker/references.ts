import { PI_MODEL_REFERENCE_SEPARATOR } from "#synapse/integration/pi/model-reference"
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
  return Array.from(listedModels(context), (model) => `${model.provider}${PI_MODEL_REFERENCE_SEPARATOR}${model.id}`)
}
