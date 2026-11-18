import { type AgentSession, type AgentSessionEvent } from "@earendil-works/pi-coding-agent"
import { TEAM_HISTORY_ADMISSION_ENTRY } from "#synapse/integration/pi/agent-team"
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
import {
  ADMISSION_CUSTOM_ENTRY_TYPE,
  ADMISSION_ENTRY_APPENDED_EVENT,
  ADMISSION_NAVIGATE_ACTION,
  ADMISSION_NOT_MOUNTED,
  ADMISSION_OBSERVATION_FAILURE,
  ADMISSION_RELOAD_ACTION,
} from "./constants"
import { type AdmissionNativeAction } from "./types"

export class AdmissionNativeCallback {
  readonly failure = new Error(ADMISSION_OBSERVATION_FAILURE)

  result?: TeamAdmissionResult

  private lead?: TeamLead

  private team?: AgentTeam

  private session?: AgentSession

  private target = ""

  private readonly action: AdmissionNativeAction

  private pending = true

  private running?: Promise<void>

  constructor(action: AdmissionNativeAction) {
    this.action = action
  }

  mount(lead: TeamLead, sessions: MemberSessions, clock: TeamClock): AgentTeam {
    this.lead = lead
    this.team = createAgentTeam({ ...lead, recordAdmission: this.recordAdmission.bind(this) }, sessions, clock)
    return this.team
  }

  arm(session: AgentSession, target: string): void {
    this.session = session
    this.target = target
    session.subscribe(this.onEvent.bind(this))
  }

  private recordAdmission(record: MemberRecord, task: TaskSnapshot): TeamAdmissionResult {
    if (!this.lead) {
      throw new Error(ADMISSION_NOT_MOUNTED)
    }
    const result = this.lead.recordAdmission(record, task)
    this.result = result
    return result
  }

  private onEvent(event: AgentSessionEvent): void {
    if (
      this.pending &&
      event.type === ADMISSION_ENTRY_APPENDED_EVENT &&
      event.entry.type === ADMISSION_CUSTOM_ENTRY_TYPE &&
      event.entry.customType === TEAM_HISTORY_ADMISSION_ENTRY &&
      this.session &&
      this.team
    ) {
      this.pending = false
      if (this.action === ADMISSION_NAVIGATE_ACTION) {
        this.running = this.navigate()
      } else if (this.action === ADMISSION_RELOAD_ACTION) {
        this.running = this.session.reload()
      } else {
        this.running = this.team.suspend()
      }
      throw this.failure
    }
  }

  private async navigate(): Promise<void> {
    if (this.session) {
      await this.session.navigateTree(this.target)
    }
  }

  async waitFinished(): Promise<void> {
    await this.running
  }
}
