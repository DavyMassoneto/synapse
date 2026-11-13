import { type Api, type Model } from "@earendil-works/pi-ai"
import { fixtureModel } from "../context"
import { ROUTER_TEST_CONTEXT_WINDOW, ROUTER_TEST_IMAGE, ROUTER_TEST_TEXT } from "./constants"

export function imageModel(provider: string, id: string): Model<Api> {
  return {
    ...fixtureModel(provider, id, ROUTER_TEST_CONTEXT_WINDOW),
    input: [ROUTER_TEST_TEXT, ROUTER_TEST_IMAGE],
  }
}
