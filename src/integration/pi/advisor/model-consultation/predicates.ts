import { type Api, type Model } from "@earendil-works/pi-ai"
import { type ResolvedModel } from "#synapse/modules"

export function hasSameCapabilities(model: Model<Api>, resolved: ResolvedModel): boolean {
  return model.contextWindow === resolved.contextWindow && model.maxTokens === resolved.maxOutputTokens
}
