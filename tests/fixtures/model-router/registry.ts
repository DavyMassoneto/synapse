import {
  type Api,
  type ClassifierApi,
  type ClassifierChoiceAnswer,
  type ClassifierContext,
  type ClassifierModel,
  type ClassifierResult,
  type Model,
} from "@earendil-works/pi-ai"
import { type PiRouterClassifierModel, type PiRouterRegistry } from "#synapse/integration"
import { fixtureModel } from "../context"
import {
  ROUTER_FIXTURE_CLASSIFIER,
  ROUTER_TEST_CHOICE,
  ROUTER_TEST_CLASSIFIER_MODEL,
  ROUTER_TEST_CLASSIFIER_PROVIDER,
  ROUTER_TEST_ERROR,
  ROUTER_TEST_FALLBACK,
  ROUTER_TEST_FIRST,
  ROUTER_TEST_HIGH,
  ROUTER_TEST_IMAGE,
  ROUTER_TEST_MODEL_QUESTION,
  ROUTER_TEST_PROVIDER,
  ROUTER_TEST_SECOND,
  ROUTER_TEST_STOP,
  ROUTER_TEST_TEXT,
} from "./constants"

export class RouterFixtureRegistry implements PiRouterRegistry {
  models: Model<Api>[] = [
    {
      ...fixtureModel(ROUTER_TEST_PROVIDER, ROUTER_TEST_FIRST, 100000),
      input: [ROUTER_TEST_TEXT, ROUTER_TEST_IMAGE],
    },
    {
      ...fixtureModel(ROUTER_TEST_PROVIDER, ROUTER_TEST_SECOND, 100000),
      input: [ROUTER_TEST_TEXT, ROUTER_TEST_IMAGE],
    },
    {
      ...fixtureModel(ROUTER_TEST_PROVIDER, ROUTER_TEST_FALLBACK, 100000),
      input: [ROUTER_TEST_TEXT, ROUTER_TEST_IMAGE],
    },
  ]
  calls = 0

  classifierFails = false

  stopReason: ClassifierResult["stopReason"] = ROUTER_TEST_STOP

  unauthorized = new Set<string>()

  revokeOnClassify = false

  selected = ROUTER_TEST_SECOND

  getAvailable(): Model<Api>[] {
    return this.models
  }

  find(provider: string, id: string): ReturnType<PiRouterRegistry["find"]> {
    return this.models.find((model) => model.provider === provider && model.id === id)
  }

  findOfType(_type: "classifier", _provider: string, _id: string): PiRouterClassifierModel {
    return ROUTER_FIXTURE_CLASSIFIER
  }

  hasConfiguredAuth(model: Model<Api>): boolean {
    return !this.unauthorized.has(model.id)
  }

  async classify(_model: ClassifierModel<ClassifierApi>, context: ClassifierContext): Promise<ClassifierResult> {
    this.calls += 1
    if (this.revokeOnClassify) {
      this.unauthorized.add(this.selected)
    }
    const result: ClassifierResult = {
      api: ROUTER_TEST_CLASSIFIER_PROVIDER,
      provider: ROUTER_TEST_CLASSIFIER_PROVIDER,
      model: ROUTER_TEST_CLASSIFIER_MODEL,
      answers: {},
      stopReason: this.classifierFails ? ROUTER_TEST_ERROR : this.stopReason,
      timestamp: 0,
    }
    for (const [name, question] of Object.entries(context.questions)) {
      if (question.type === ROUTER_TEST_CHOICE) {
        const choice = name === ROUTER_TEST_MODEL_QUESTION ? this.selected : ROUTER_TEST_HIGH
        const probabilities: ClassifierChoiceAnswer["probabilities"] = {}
        for (const option of Object.keys(question.criteria)) {
          probabilities[option] = option === choice ? 1 : 0
        }
        result.answers[name] = { type: ROUTER_TEST_CHOICE, choice, probabilities, confidence: 1 }
      }
    }
    return result
  }
}
