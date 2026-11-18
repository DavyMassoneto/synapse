import {
  type AgentTeam,
  createAgentTeam,
  type MemberRecord,
  type MemberSessions,
  type OpenedMember,
  type OpenMemberRequest,
  type TaskSnapshot,
  TEAM_ADMISSION_NOT_RECORDED,
  type TeamAdmissionResult,
  type TeamClock,
  type TeamLead,
} from "#synapse/modules/agent-team"
import {
  ADMISSION_DISCARD_FAILURE,
  ADMISSION_FAILURE_MESSAGE,
  ADMISSION_FAULT_BLOCKER,
  ADMISSION_FAULT_CLOSE,
  ADMISSION_FAULT_DISCARD,
  ADMISSION_FAULT_NONE,
  ADMISSION_FAULT_OPEN,
  ADMISSION_FAULT_QUEUE,
  ADMISSION_FAULT_RECORD,
  ADMISSION_FAULT_REVISION,
  ADMISSION_MUTATED,
  ADMISSION_NOT_MOUNTED,
} from "./constants"
import { AdmissionFailingSession } from "./failing-session"
import { AdmissionFailingJournal } from "./journal"
import { type AdmissionFault } from "./types"

export class AdmissionFaults implements MemberSessions {
  readonly discardFailure = new Error(ADMISSION_DISCARD_FAILURE)

  closeFailure?: Error

  mode: AdmissionFault = ADMISSION_FAULT_NONE
  opened = 0
  discardAttempts = 0
  private sessions?: MemberSessions
  private lead?: TeamLead

  mount(lead: TeamLead, sessions: MemberSessions, clock: TeamClock): AgentTeam {
    this.lead = lead
    this.sessions = sessions
    return createAgentTeam({ ...lead, recordAdmission: this.recordAdmission.bind(this) }, this, clock)
  }

  discardPrepared(record: MemberRecord): void {
    if (!this.sessions) {
      throw new Error(ADMISSION_NOT_MOUNTED)
    }
    this.discardAttempts += 1
    this.sessions.discardPrepared(record)
    if (this.mode === ADMISSION_FAULT_DISCARD) {
      throw this.discardFailure
    }
  }

  async open(request: OpenMemberRequest, team: AgentTeam): Promise<OpenedMember> {
    if (this.mode === ADMISSION_FAULT_OPEN) {
      throw new Error(ADMISSION_FAILURE_MESSAGE)
    }
    if (!this.sessions) {
      throw new Error(ADMISSION_NOT_MOUNTED)
    }
    const opened = await this.sessions.open(request, team)
    this.opened += 1
    if (this.mode === ADMISSION_FAULT_REVISION) {
      team.updateTask("lead", { taskId: "task-1", expectedRevision: 1, action: "claim" })
    } else if (this.mode === ADMISSION_FAULT_BLOCKER) {
      team.updateTask("lead", { taskId: "task-2", expectedRevision: 3, action: "reopen" })
    }
    if (this.mode === ADMISSION_FAULT_CLOSE || this.mode === ADMISSION_FAULT_DISCARD) {
      const session = new AdmissionFailingSession(opened.session)
      this.closeFailure = session.closeFailure
      const journal = new AdmissionFailingJournal(opened.journal)
      return { ...opened, session, journal }
    }
    if (this.mode === ADMISSION_FAULT_QUEUE) {
      return { ...opened, journal: new AdmissionFailingJournal(opened.journal) }
    }
    return opened
  }

  reopen(record: MemberRecord, team: AgentTeam): Promise<OpenedMember> {
    if (!this.sessions) {
      throw new Error(ADMISSION_NOT_MOUNTED)
    }
    return this.sessions.reopen(record, team)
  }

  private recordAdmission(record: MemberRecord, task: TaskSnapshot): TeamAdmissionResult {
    if (this.mode === ADMISSION_FAULT_RECORD) {
      record.name = ADMISSION_MUTATED
      task.subject = ADMISSION_MUTATED
      task.blockedBy.push(ADMISSION_MUTATED)
      task.writeScopes.push(ADMISSION_MUTATED)
      return { kind: TEAM_ADMISSION_NOT_RECORDED, error: new Error(ADMISSION_FAILURE_MESSAGE) }
    }
    if (!this.lead) {
      throw new Error(ADMISSION_NOT_MOUNTED)
    }
    return this.lead.recordAdmission(record, task)
  }
}
