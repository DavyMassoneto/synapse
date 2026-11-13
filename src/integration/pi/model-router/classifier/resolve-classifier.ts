import { ROUTER_FAILED_KIND } from "#synapse/modules"
import {
  PI_ROUTER_CLASSIFIER_FOUND,
  PI_ROUTER_CLASSIFIER_MODEL,
  PI_ROUTER_CLASSIFIER_PROVIDER,
  PI_ROUTER_CLASSIFIER_TYPE,
  PI_ROUTER_CLASSIFIER_UNAVAILABLE,
} from "./constants"
import { type PiRouterClassificationRegistry, type PiRouterClassifierResolution } from "./types"

export function resolvePiRouterClassifier(registry: PiRouterClassificationRegistry): PiRouterClassifierResolution {
  const model = registry.findOfType(
    PI_ROUTER_CLASSIFIER_TYPE,
    PI_ROUTER_CLASSIFIER_PROVIDER,
    PI_ROUTER_CLASSIFIER_MODEL,
  )
  if (!model || model.type !== PI_ROUTER_CLASSIFIER_TYPE) {
    return { kind: ROUTER_FAILED_KIND, reason: PI_ROUTER_CLASSIFIER_UNAVAILABLE }
  }
  return { kind: PI_ROUTER_CLASSIFIER_FOUND, model }
}
