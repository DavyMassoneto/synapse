import {
  type MemberExecutionActivity,
  type MemberSession,
  type MemberTurnRuntime,
} from "#synapse/modules/agent-team/public/contracts"
import {
  MEMBER_WATCHDOG_CONFIRMED,
  MEMBER_WATCHDOG_UNCONFIRMED,
  MemberTurnActivity,
  MemberTurnWatchdog,
} from "../turn-watchdog"
import { TeamMemberNotification } from "./notification"
import { stopMemberTurn } from "./stop-turn"
import { type TeamMemberObserver, type TeamMemberStopConfirmed, type TeamMemberStopPolicy } from "./types"

export class TeamMemberTurnControl {
  private readonly activityPolicy: MemberTurnActivity

  private readonly watchdog: MemberTurnWatchdog

  private readonly session: MemberSession
  private readonly notification: TeamMemberNotification

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

  accepts(executionId: number): boolean {
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
        confirmed: this.confirmStop.bind(this, executionId),
        unconfirmed: this.unconfirmedStop.bind(this, executionId),
        failed: this.notification.report.bind(this.notification),
        notice: this.notification.deliver.bind(this.notification),
      }
      stopMemberTurn(this.session, policy)
    }
  }

  readonly ensureHealthy: TeamMemberNotification["ensureHealthy"]

  private confirmStop(executionId: number): void {
    if (executionId === this.executionId) {
      this.stopPending = false
      try {
        this.notification.deliver(MEMBER_WATCHDOG_CONFIRMED)
      } finally {
        if (this.active && !this.session.isStreaming()) {
          this.confirmed()
        }
      }
    }
  }

  private unconfirmedStop(executionId: number): void {
    if (executionId === this.executionId) {
      this.stopPending = false
      try {
        this.notification.deliver(MEMBER_WATCHDOG_UNCONFIRMED)
      } finally {
        if (this.settledDuringStop) {
          this.confirmed()
        }
      }
    }
  }
}
