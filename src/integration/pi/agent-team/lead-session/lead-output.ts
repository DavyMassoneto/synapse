import {
  type MemberRecord,
  type TaskSnapshot,
  TEAM_ADMISSION_PERSISTENCE_FAILED,
  TEAM_ADMISSION_RECORDED,
  TEAM_ADMISSION_UNCERTAIN,
  type TeamAdmissionResult,
} from "#synapse/modules/agent-team"
import {
  TEAM_HISTORY_ADMISSION_ENTRY,
  TEAM_HISTORY_BOARD_CLEAN_ENTRY,
  TEAM_HISTORY_MEMBER_ENTRY,
  TEAM_HISTORY_TASK_ENTRY,
} from "../session-history"
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

  recordTaskCleanup(tasks: TaskSnapshot[]): void {
    this.pi.appendEntry(TEAM_HISTORY_BOARD_CLEAN_ENTRY, { tasks })
  }

  recordTask(task: TaskSnapshot): void {
    this.pi.appendEntry(TEAM_HISTORY_TASK_ENTRY, task)
  }

  recordAdmission(record: MemberRecord, task: TaskSnapshot): TeamAdmissionResult {
    try {
      this.pi.appendEntry(TEAM_HISTORY_ADMISSION_ENTRY, { record, task })
      return { kind: TEAM_ADMISSION_RECORDED }
    } catch (failure) {
      if (failure instanceof Error) {
        return { kind: TEAM_ADMISSION_UNCERTAIN, error: failure }
      }
      return {
        kind: TEAM_ADMISSION_UNCERTAIN,
        error: new Error(TEAM_ADMISSION_PERSISTENCE_FAILED, { cause: failure }),
      }
    }
  }

  recordMember(record: MemberRecord): void {
    this.pi.appendEntry(TEAM_HISTORY_MEMBER_ENTRY, record)
  }
}
