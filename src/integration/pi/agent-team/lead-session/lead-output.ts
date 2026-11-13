import { type MemberRecord, type TaskSnapshot } from "#synapse/modules"
import { TEAM_HISTORY_MEMBER_ENTRY, TEAM_HISTORY_TASK_ENTRY } from "../session-history"
import { TEAM_PI_NOTICE_TYPE, TEAM_PI_STEER } from "./constants"
import { type AgentTeamLeadHost } from "./types"

export class PiTeamLeadOutput {
  private readonly pi: AgentTeamLeadHost

  constructor(pi: AgentTeamLeadHost) {
    this.pi = pi
  }

  deliver(text: string): void {
    this.pi.sendMessage(
      { customType: TEAM_PI_NOTICE_TYPE, content: text, display: true },
      { triggerTurn: true, deliverAs: TEAM_PI_STEER },
    )
  }

  recordTask(task: TaskSnapshot): void {
    this.pi.appendEntry(TEAM_HISTORY_TASK_ENTRY, task)
  }

  recordMember(record: MemberRecord): void {
    this.pi.appendEntry(TEAM_HISTORY_MEMBER_ENTRY, record)
  }
}
