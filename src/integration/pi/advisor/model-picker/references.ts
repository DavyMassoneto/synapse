import { formatModelReference } from "#synapse/modules/advisor/public"
import { type AdvisorContext } from "../host"

export function modelReferences(context: AdvisorContext): string[] {
  if (context.scopedModels.length > 0) {
    return context.scopedModels.map((entry) => formatModelReference(entry.model.provider, entry.model.id))
  }
  return context.modelRegistry.getAvailable().map((model) => formatModelReference(model.provider, model.id))
}
