import {
  type MemberExecutionActivity,
  type MemberSession,
  type MemberTurnRuntime,
} from "#synapse/modules/agent-team/public/contracts"
import { MemberTurnActivity, MemberTurnWatchdog } from "../turn-watchdog"
import { MEMBER_STOP_CONFIRMED, MEMBER_STOP_UNCONFIRMED } from "./constants"
import { TeamMemberNotification } from "./notification"
import { TeamMemberStopResult } from "./stop-result"
import { stopMemberTurn } from "./stop-turn"
import {
  type TeamMemberObserver,
  type TeamMemberStopConfirmed,
  type TeamMemberStopOutcome,
  type TeamMemberStopPolicy,
} from "./types"

export class TeamMemberTurnControl {
  private readonly activityPolicy: MemberTurnActivity

  private readonly watchdog: MemberTurnWatchdog

  private readonly session: MemberSession

  private readonly notification: TeamMemberNotification

  private readonly stopResult: TeamMemberStopResult

  private readonly confirmed: TeamMemberStopConfirmed

  private executionId = 0

  private stopPending = false

  private active = false

  private settledDuringStop = false

  constructor(
    name: string,
    session: MemberSession,
    observer: TeamMemberObserver,
    runtime: MemberTurnRuntime,
    confirmed: TeamMemberStopConfirmed,
  ) {
    this.session = session
    this.notification = new TeamMemberNotification(name, observer)
    this.ensureHealthy = this.notification.ensureHealthy.bind(this.notification)
    this.confirmed = confirmed
    this.stopResult = new TeamMemberStopResult(this, this.notification)
    this.watchdog = new MemberTurnWatchdog(runtime, this)
    this.activityPolicy = new MemberTurnActivity(this.watchdog)
  }

  get stopping(): boolean {
    return this.stopPending
  }

  begin(): number {
    this.invalidate()
    this.active = true
    this.settledDuringStop = false
    return this.executionId
  }

  invalidate(): void {
    this.executionId++
    this.watchdog.invalidate()
    this.activityPolicy.clear()
    this.active = false
    this.stopPending = false
  }

  isCurrentExecution(executionId: number): boolean {
    return this.active && executionId === this.executionId
  }

  acceptSettlement(): boolean {
    if (this.stopPending) {
      this.watchdog.invalidate()
      this.settledDuringStop = true
    }
    return !this.stopPending
  }

  activity(event: MemberExecutionActivity): void {
    if (event.executionId === this.executionId && this.active && !this.stopPending) {
      this.activityPolicy.record(event)
    }
  }

  expired(executionId: number): void {
    if (this.active && executionId === this.executionId && !this.stopPending) {
      this.stopPending = true
      const policy: TeamMemberStopPolicy = {
        confirmed: this.stopResult.finish.bind(this.stopResult, executionId, MEMBER_STOP_CONFIRMED),
        unconfirmed: this.stopResult.finish.bind(this.stopResult, executionId, MEMBER_STOP_UNCONFIRMED),
        failed: this.notification.operationalFailure.bind(this.notification),
        notice: this.notification.deliver.bind(this.notification),
      }
      stopMemberTurn(this.session, policy)
    }
  }

  readonly ensureHealthy: TeamMemberNotification["ensureHealthy"]

  finishStop(outcome: TeamMemberStopOutcome): void {
    this.stopPending = false
    if (outcome === MEMBER_STOP_UNCONFIRMED) {
      if (this.settledDuringStop) {
        this.confirmed()
      }
    } else if (this.active && !this.session.isStreaming()) {
      this.confirmed()
    }
  }
}
