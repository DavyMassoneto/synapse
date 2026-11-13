import { ContextualModelRouter } from "../internal"
import { type ModelRouter, type RouterClassifier } from "./contracts"

export function createModelRouter(classifier: RouterClassifier): ModelRouter {
  return new ContextualModelRouter(classifier)
}
