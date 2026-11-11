import { type SessionProjection } from "@earendil-works/pi-coding-agent"
import { type AdvisorContext } from "#synapse/integration"
import { type ThinkingLevel } from "#synapse/modules"

export type TestStopReason = "stop" | "aborted" | "error"

export type ContextUI = AdvisorContext["ui"]

export type ContextRegistry = AdvisorContext["modelRegistry"]

export type ScopedModels = AdvisorContext["scopedModels"]

export type ReasoningLevel = Exclude<ThinkingLevel, "off">

export type ProjectedMessages = SessionProjection["messages"]
