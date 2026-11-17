import { type Static } from "typebox"
import { type TeamHistoryAdmissionSchema } from "#synapse/integration/pi/agent-team"

export type AdmissionEntry = Static<typeof TeamHistoryAdmissionSchema>

export type AdmissionFault = "none" | "open" | "queue" | "record" | "revision" | "blocker" | "close" | "discard"
