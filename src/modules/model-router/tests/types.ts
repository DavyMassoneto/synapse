import { type ModelRouter, type RouteRequest } from "../public"
import { type RouterClassifierDouble } from "./doubles"

export interface RouterTestSut {
  router: ModelRouter
  classifier: RouterClassifierDouble
  request: RouteRequest
}
