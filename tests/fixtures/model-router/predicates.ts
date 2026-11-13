import { type Api, type Model } from "@earendil-works/pi-ai"

export function isRouterFixtureModel(provider: string, id: string, model: Model<Api>): boolean {
  return model.provider === provider && model.id === id
}
