import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { Value } from "typebox/value"
import { TeamHistoryAdmissionSchema } from "#synapse/integration/pi/agent-team"
import { ADMISSION_CUSTOM, ADMISSION_ENTRY } from "./constants"
import { type AdmissionEntry } from "./types"

export function admissionEntries(session: AgentSession) {
  const admissions: AdmissionEntry[] = []
  for (const entry of session.sessionManager.getBranch()) {
    if (entry.type === ADMISSION_CUSTOM && entry.customType === ADMISSION_ENTRY) {
      admissions.push(Value.Parse(TeamHistoryAdmissionSchema, entry.data))
    }
  }
  return admissions
}
