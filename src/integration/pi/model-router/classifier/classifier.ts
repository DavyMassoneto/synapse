import {
  type ClassifierOutcome,
  type ClassifierRequest,
  ROUTER_FAILED_KIND,
  type RouterClassifier,
} from "#synapse/modules"
import { buildPiRouterClassifierContext } from "./classifier-context"
import { piRouterClassifierOptions } from "./classifier-options"
import { convertPiRouterClassifierResult } from "./classifier-response"
import { resolvePiRouterClassifier } from "./resolve-classifier"
import { type PiRouterClassificationContext } from "./types"

export class PiRouterClassifier implements RouterClassifier {
  private readonly context: PiRouterClassificationContext

  constructor(context: PiRouterClassificationContext) {
    this.context = context
  }

  async classify(request: ClassifierRequest, signal?: AbortSignal): Promise<ClassifierOutcome> {
    const registry = this.context.modelRegistry
    const resolution = resolvePiRouterClassifier(registry)
    if (resolution.kind === ROUTER_FAILED_KIND) {
      return resolution
    }
    const context = buildPiRouterClassifierContext(request)
    const options = piRouterClassifierOptions(signal)
    const result = await registry.classify(resolution.model, context, options)
    return convertPiRouterClassifierResult(result, request.question.name, signal)
  }
}
