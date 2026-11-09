import { type Api, type Model } from "@earendil-works/pi-ai"

export function modelReference(model: Model<Api>): string {
  return [model.provider, model.id].join("/")
}
