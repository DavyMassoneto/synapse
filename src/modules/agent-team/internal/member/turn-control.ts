import {
  MEMBER_ACTIVITY_SETTLED,
  MEMBER_ACTIVITY_STARTED,
  type MemberExecutionActivity,
  type MemberSession,
  type MemberTurnRuntime,
} from "#synapse/modules/agent-team/public/contracts"
import {
  MEMBER_WATCHDOG_CONFIRMED,
  MEMBER_WATCHDOG_NOTIFICATION_FAILED,
  MEMBER_WATCHDOG_UNCONFIRMED,
  MemberTurnWatchdog,
} from "../turn-watchdog"
import { stopMemberTurn } from "./stop-turn"
import { type TeamMemberObserver, type TeamMemberStopConfirmed, type TeamMemberStopPolicy } from "./types"

export class TeamMemberTurnControl {
  private readonly watchdog: MemberTurnWatchdog
  private readonly session: MemberSession
  private readonly observer: TeamMemberObserver
  private readonly confirmed: TeamMemberStopConfirmed
  private notificationFailure?: Error
  private readonly name: string
  private executionId = 0
  stopping = false
  private active = false
  private settledDuringStop = false
  constructor(
    name: string,
    session: MemberSession,
    observer: TeamMemberObserver,
    runtime: MemberTurnRuntime,
    confirmed: TeamMemberStopConfirmed,
  ) {
    this.name = name
    this.session = session
    this.observer = observer
    this.confirmed = confirmed
    this.watchdog = new MemberTurnWatchdog(runtime, this)
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
    this.active = false
    this.stopping = false
  }
  accepts(executionId: number): boolean {
    return this.active && executionId === this.executionId
  }
  acceptSettlement(): boolean {
    this.watchdog.invalidate()
    if (this.stopping) {
      this.settledDuringStop = true
    }
    return !this.stopping
  }
  activity(event: MemberExecutionActivity): void {
    if (event.executionId === this.executionId && this.active && !this.stopping) {
      if (event.phase === MEMBER_ACTIVITY_STARTED) {
        this.watchdog.start(event.executionId)
      } else if (event.phase === MEMBER_ACTIVITY_SETTLED) {
        this.watchdog.invalidate()
      } else {
        this.watchdog.update(event.executionId)
      }
    }
  }
  expired(executionId: number): void {
    if (this.active && executionId === this.executionId && !this.stopping) {
      this.stopping = true
      const policy: TeamMemberStopPolicy = {
        confirmed: this.confirmStop.bind(this, executionId),
        unconfirmed: this.unconfirmedStop.bind(this, executionId),
        failed: this.reportNotificationFailure.bind(this),
      }
      if (this.observer.memberNotice) {
        policy.notice = this.observer.memberNotice.bind(this.observer)
      }
      stopMemberTurn(this.session, policy)
    }
  }
  ensureHealthy(): void {
    if (this.notificationFailure) {
      throw this.notificationFailure
    }
  }
  private reportNotificationFailure(message: string): void {
    try {
      this.observer.memberStartFailed(this.name, message)
    } catch (failure) {
      if (failure instanceof Error) {
        this.notificationFailure = failure
      } else {
        this.notificationFailure = new Error(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
      }
    }
  }
  private confirmStop(executionId: number): void {
    if (executionId === this.executionId) {
      this.stopping = false
      try {
        this.observer.memberNotice?.(MEMBER_WATCHDOG_CONFIRMED)
      } finally {
        if (this.active && !this.session.isStreaming()) {
          this.confirmed()
        }
      }
    }
  }
  private unconfirmedStop(executionId: number): void {
    if (executionId === this.executionId) {
      this.stopping = false
      try {
        this.observer.memberNotice?.(MEMBER_WATCHDOG_UNCONFIRMED)
      } finally {
        if (this.settledDuringStop) {
          this.confirmed()
        }
      }
    }
  }
}
