import {
  type AgentTeam,
  createAgentTeam,
  type MemberSessions,
  type TaskSnapshot,
  type TeamClock,
  type TeamLead,
} from "#synapse/modules/agent-team"
import { MESSAGING_FAILURE, MESSAGING_MUTATED, MESSAGING_NOT_MOUNTED } from "./constants"

export class MessagingFaults {
  failJournal = false
  private lead?: TeamLead

  mount(lead: TeamLead, sessions: MemberSessions, clock: TeamClock): AgentTeam {
    this.lead = lead
    return createAgentTeam({ ...lead, recordTask: this.recordTask.bind(this) }, sessions, clock)
  }

  private recordTask(task: TaskSnapshot): void {
    if (this.failJournal) {
      task.subject = MESSAGING_MUTATED
      task.blockedBy.push(MESSAGING_MUTATED)
      task.writeScopes.push(MESSAGING_MUTATED)
      throw new Error(MESSAGING_FAILURE)
    }
    if (!this.lead) {
      throw new Error(MESSAGING_NOT_MOUNTED)
    }
    this.lead.recordTask(task)
  }
}
