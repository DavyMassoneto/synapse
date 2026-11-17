import { type AgentSession, SessionManager } from "@earendil-works/pi-coding-agent"
import { admissionEntries } from "../task-admission"
import { MESSAGING_NOT_MOUNTED } from "./constants"

export function messagingMemberMessages(session: AgentSession, name: string) {
  const admission = admissionEntries(session).find((entry) => entry.record.name === name)
  if (!admission) {
    throw new Error(MESSAGING_NOT_MOUNTED)
  }
  return SessionManager.open(admission.record.sessionFile).buildSessionContext().messages
}
