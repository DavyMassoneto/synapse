import { type Api, type Model } from "@earendil-works/pi-ai"
import { type AdvisorContext } from "../host"

function modelReference(model: Model<Api>): string {
  return `${model.provider}/${model.id}`
}

export function modelReferences(context: AdvisorContext): string[] {
  if (context.scopedModels.length > 0) {
    return context.scopedModels.map((entry) => modelReference(entry.model))
  }
  return context.modelRegistry.getAvailable().map(modelReference)
}
