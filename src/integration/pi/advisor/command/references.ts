import { type AdvisorContext } from "../contracts"
import { modelReference } from "./reference"

export function modelReferences(context: AdvisorContext): string[] {
  const references: string[] = []
  if (context.scopedModels.length > 0) {
    for (const entry of context.scopedModels) {
      references.push(modelReference(entry.model))
    }
    return references
  }
  for (const model of context.modelRegistry.getAvailable()) {
    references.push(modelReference(model))
  }
  return references
}
