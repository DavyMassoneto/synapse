import {
  type AgentTeam,
  createAgentTeam,
  type MemberRecord,
  type MemberSessions,
  type TaskSnapshot,
  type TeamAdmissionResult,
  type TeamClock,
  type TeamLead,
} from "#synapse/modules/agent-team"

import { ADMISSION_NOT_MOUNTED } from "./constants"

export class AdmissionReentrantJournal {
  private lead?: TeamLead

  private team?: AgentTeam

  private stopping?: Promise<void>

  mount(lead: TeamLead, sessions: MemberSessions, clock: TeamClock): AgentTeam {
    this.lead = lead
    this.team = createAgentTeam({ ...lead, recordAdmission: this.recordAdmission.bind(this) }, sessions, clock)
    return this.team
  }

  private recordAdmission(record: MemberRecord, task: TaskSnapshot): TeamAdmissionResult {
    if (this.lead && this.team) {
      const result = this.lead.recordAdmission(record, task)
      this.stopping = this.team.suspend()
      return result
    }
    throw new Error(ADMISSION_NOT_MOUNTED)
  }

  async waitStopped(): Promise<void> {
    await this.stopping
  }
}
