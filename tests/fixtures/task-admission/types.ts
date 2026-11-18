import { type Static } from "typebox"
import { type TeamHistoryAdmissionSchema } from "#synapse/integration/pi/agent-team"

import { type ScriptedProviderStep } from "../scripted-provider"

interface AdmissionToolCallKind {
  kind: "toolCall"
}

export type AdmissionToolCallStep = Extract<ScriptedProviderStep, AdmissionToolCallKind>

export type AdmissionEntry = Static<typeof TeamHistoryAdmissionSchema>

export interface AdmissionRefusalScenario {
  name: string
  argumentsJson: string
}

export type AdmissionFault = "none" | "open" | "queue" | "record" | "revision" | "blocker" | "close" | "discard"

export type AdmissionNativeAction = "navigate" | "reload" | "suspend"

export type AdmissionObservationFault = "clock" | "monotonic" | "callback" | "port-throw"

export type AdmissionObservationAction = "none" | "suspend" | "restore"

export type AdmissionObservationOperation = "admission" | "task" | "cleanup"
