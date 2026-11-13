import { type ModelRouter, type RouteRequest } from "../public"
import { type RouterTestClassifier } from "./doubles"

export interface RouterSelectionSut {
  router: ModelRouter
  request: RouteRequest
  classifier: RouterTestClassifier
}
