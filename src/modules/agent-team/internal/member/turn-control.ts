import {
  MEMBER_ACTIVITY_SETTLED,
  MEMBER_ACTIVITY_STARTED,
  type MemberExecutionActivity,
  type MemberSession,
  type MemberTurnRuntime,
} from "#synapse/modules/agent-team/public/contracts"
import {
  MEMBER_WATCHDOG_CONFIRMED,
  MEMBER_WATCHDOG_NOTICE,
  MEMBER_WATCHDOG_UNCONFIRMED,
  MemberTurnWatchdog,
} from "../turn-watchdog"
import { type TeamMemberObserver, type TeamMemberStopConfirmed } from "./types"

export class TeamMemberTurnControl {
  private readonly watchdog: MemberTurnWatchdog
  private readonly session: MemberSession
  private readonly observer: TeamMemberObserver
  private readonly confirmed: TeamMemberStopConfirmed
  private executionId = 0
  stopping = false
  private active = false
  private settledDuringStop = false
  constructor(
    session: MemberSession,
    observer: TeamMemberObserver,
    runtime: MemberTurnRuntime,
    confirmed: TeamMemberStopConfirmed,
  ) {
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
      try {
        const stopped = this.session.abort()
        stopped.then(this.confirmStop.bind(this, executionId), this.unconfirmedStop.bind(this, executionId))
        this.observer.memberNotice?.(MEMBER_WATCHDOG_NOTICE)
      } catch {
        this.observer.memberNotice?.(MEMBER_WATCHDOG_NOTICE)
        this.unconfirmedStop(executionId)
      }
    }
  }
  private confirmStop(executionId: number): void {
    if (executionId === this.executionId) {
      this.observer.memberNotice?.(MEMBER_WATCHDOG_CONFIRMED)
      this.stopping = false
      if (this.active && !this.session.isStreaming()) {
        this.confirmed()
      }
    }
  }
  private unconfirmedStop(executionId: number): void {
    if (executionId === this.executionId) {
      this.observer.memberNotice?.(MEMBER_WATCHDOG_UNCONFIRMED)
      this.stopping = false
      if (this.settledDuringStop) {
        this.confirmed()
      }
    }
  }
}
