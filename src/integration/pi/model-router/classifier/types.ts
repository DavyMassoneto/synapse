import { type ClassifierApi, type ClassifierModel } from "@earendil-works/pi-ai"
import { type ExtensionContext } from "@earendil-works/pi-coding-agent"
import { type RouterClassifierFailed } from "#synapse/modules"

export interface PiRouterClassificationContext {
  modelRegistry: PiRouterClassificationRegistry
}

export type PiRouterClassificationRegistry = Pick<ExtensionContext["modelRegistry"], "classify"> &
  PiRouterClassificationLookup

export interface PiRouterClassificationLookup {
  findOfType(
    type: "classifier",
    provider: string,
    id: string,
  ): ReturnType<ExtensionContext["modelRegistry"]["findOfType"]>
}

export type PiClassifyOptions = NonNullable<Parameters<ExtensionContext["modelRegistry"]["classify"]>[2]>

export interface PiRouterClassifierFound {
  kind: "found"
  model: ClassifierModel<ClassifierApi>
}

export type PiRouterClassifierResolution = PiRouterClassifierFound | RouterClassifierFailed
