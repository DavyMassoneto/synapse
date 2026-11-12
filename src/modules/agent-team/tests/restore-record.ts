import { type MemberRecord } from "../public"

export function restoreRecord(name: string): MemberRecord {
  return {
    leadId: "lead",
    name,
    description: "x",
    model: "x",
    thinking: "x",
    cwd: "x",
    sessionId: "x",
    sessionFile: "x",
  }
}
