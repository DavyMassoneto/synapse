import {
  type AgentTeam,
  createAgentTeam,
  type MemberRecord,
  type MemberSessions,
  type MemberTurnRuntime,
  type OpenMemberRequest,
  TASK_PENDING,
  type TaskSnapshot,
  type TeamAdmissionResult,
  type TeamClock,
  type TeamLead,
} from "#synapse/modules/agent-team"
import { WatchdogClock } from "../team-watchdog"
import {
  ADMISSION_CALLBACK_FAULT,
  ADMISSION_CLOCK_FAULT,
  ADMISSION_LEAD_NAME,
  ADMISSION_MONOTONIC_FAULT,
  ADMISSION_NO_ACTION,
  ADMISSION_OBSERVATION_FAILURE,
  ADMISSION_PORT_THROW_FAULT,
  ADMISSION_RESTORE_ACTION,
} from "./constants"
import { AdmissionFailingSession } from "./failing-session"
import { type AdmissionObservationAction, type AdmissionObservationFault } from "./types"

export class AdmissionObservationFaults {
  readonly failure = new Error(ADMISSION_OBSERVATION_FAILURE)

  private readonly fault: AdmissionObservationFault

  private readonly action: AdmissionObservationAction

  readonly closeFailure = new Error(ADMISSION_OBSERVATION_FAILURE)

  private readonly failClose: boolean

  private sessions?: MemberSessions

  private lead?: TeamLead

  private team?: AgentTeam

  private clock?: TeamClock

  private runtime?: MemberTurnRuntime

  private armed = false

  private triggered = false

  get wasTriggered(): boolean {
    return this.triggered
  }

  private stopping?: Promise<void>

  private snapshots: TaskSnapshot[] = []

  constructor(fault: AdmissionObservationFault, action: AdmissionObservationAction, failClose: boolean) {
    this.failClose = failClose
    this.fault = fault
    this.action = action
  }

  mount(lead: TeamLead, sessions: MemberSessions, clock: TeamClock): AgentTeam {
    this.lead = lead
    this.sessions = sessions
    this.clock = clock
    this.runtime = new WatchdogClock()
    const runtime: MemberTurnRuntime = {
      schedule: this.runtime.schedule.bind(this.runtime),
      monotonic: this.monotonic.bind(this),
    }
    this.team = createAgentTeam(
      {
        ...lead,
        recordAdmission: this.recordAdmission.bind(this),
        recordTask: this.recordTask.bind(this),
        recordTaskCleanup: this.recordCleanup.bind(this),
      },
      {
        open: this.open.bind(this),
        reopen: sessions.reopen.bind(sessions),
        discardPrepared: sessions.discardPrepared.bind(sessions),
      },
      this.timestamp.bind(this),
      runtime,
    )
    return this.team
  }

  private async open(request: OpenMemberRequest, team: AgentTeam) {
    if (!this.sessions) {
      throw this.failure
    }
    const opened = await this.sessions.open(request, team)
    if (this.failClose) {
      const failing = new AdmissionFailingSession(opened.session, this.closeFailure)
      return { ...opened, session: failing }
    }
    return opened
  }

  arm(): void {
    this.armed = true
  }

  private timestamp(): string {
    this.trigger(ADMISSION_CLOCK_FAULT)
    if (this.clock) {
      return this.clock()
    }
    throw this.failure
  }

  private monotonic(): number {
    this.trigger(ADMISSION_MONOTONIC_FAULT)
    if (this.runtime) {
      return this.runtime.monotonic()
    }
    throw this.failure
  }

  private recordAdmission(record: MemberRecord, task: TaskSnapshot): TeamAdmissionResult {
    if (!this.lead) {
      throw this.failure
    }
    this.snapshots = [task]
    const result = this.lead.recordAdmission(record, task)
    this.trigger(ADMISSION_CALLBACK_FAULT)
    this.trigger(ADMISSION_PORT_THROW_FAULT)
    return result
  }

  private recordTask(task: TaskSnapshot): void {
    this.snapshots = [task]
    this.lead?.recordTask(task)
    this.trigger(ADMISSION_CALLBACK_FAULT)
  }

  private recordCleanup(tasks: TaskSnapshot[]): void {
    this.snapshots = tasks
    this.lead?.recordTaskCleanup(tasks)
    this.trigger(ADMISSION_CALLBACK_FAULT)
  }

  private trigger(fault: AdmissionObservationFault): void {
    if (this.armed && !this.triggered && this.fault === fault) {
      this.triggered = true
      if (this.team && this.action !== ADMISSION_NO_ACTION) {
        if (this.action === ADMISSION_RESTORE_ACTION) {
          const snapshots: TaskSnapshot[] = []
          for (const task of this.snapshots) {
            snapshots.push({ ...task, owner: ADMISSION_LEAD_NAME, status: TASK_PENDING })
          }
          this.stopping = this.team.restore([], snapshots)
        } else {
          this.stopping = this.team.suspend()
        }
      }
      if (this.action === ADMISSION_NO_ACTION || fault === ADMISSION_PORT_THROW_FAULT) {
        throw this.failure
      }
    }
  }

  async waitStopped(): Promise<void> {
    await this.stopping
  }
}
