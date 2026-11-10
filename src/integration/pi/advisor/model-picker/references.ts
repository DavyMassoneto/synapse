import { formatModelReference } from "#synapse/modules"
import { type AdvisorContext } from "../host-context"

export function modelReferences(context: AdvisorContext): string[] {
  if (context.scopedModels.length > 0) {
    return context.scopedModels.map((entry) => formatModelReference(entry.model.provider, entry.model.id))
  }
  return context.modelRegistry.getAvailable().map((model) => formatModelReference(model.provider, model.id))
}
