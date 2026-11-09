import { type SessionProjection } from "@earendil-works/pi-coding-agent"
import { type AdvisorContext } from "#synapse/integration"

export type TestStopReason = "stop" | "aborted"
export type ScopedModels = AdvisorContext["scopedModels"]

export type ProjectedMessages = SessionProjection["messages"]
