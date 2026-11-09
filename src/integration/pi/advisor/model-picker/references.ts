import { type AdvisorContext } from "../host"
import { modelReference } from "./reference"

export function modelReferences(context: AdvisorContext): string[] {
  if (context.scopedModels.length > 0) {
    return context.scopedModels.map((entry) => modelReference(entry.model))
  }
  return context.modelRegistry.getAvailable().map((model) => modelReference(model))
}
