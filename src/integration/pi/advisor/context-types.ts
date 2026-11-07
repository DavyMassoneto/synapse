import {
  type ExtensionContext,
  type ExtensionUIContext,
  type ModelRegistry,
} from "@earendil-works/pi-coding-agent";

export type AdvisorUI = Pick<ExtensionUIContext, "notify" | "select" | "setStatus">;
export type AdvisorRegistry = Pick<
  ModelRegistry,
  "getAvailable" | "find" | "hasConfiguredAuth" | "streamSimple"
>;
export type AdvisorSession = Pick<ExtensionContext["sessionManager"], "buildSessionProjection">;

export interface AdvisorContext
  extends Pick<ExtensionContext, "hasUI" | "scopedModels" | "getSystemPrompt"> {
  ui: AdvisorUI;
  modelRegistry: AdvisorRegistry;
  sessionManager: AdvisorSession;
}
