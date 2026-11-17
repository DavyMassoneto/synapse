import { MEMBER_WATCHDOG_NOTIFICATION_FAILED, MEMBER_WATCHDOG_OPERATION_FAILED } from "../turn-watchdog"
import { type TeamMemberObserver } from "./types"

export class TeamMemberNotification {
  private readonly failures: Error[] = []

  private readonly name: string

  private readonly observer: TeamMemberObserver

  constructor(name: string, observer: TeamMemberObserver) {
    this.name = name
    this.observer = observer
  }

  deliver(message: string): void {
    try {
      this.observer.memberNotice(message)
    } catch (failure) {
      if (failure instanceof Error) {
        this.failures.push(failure)
      } else {
        this.failures.push(new Error(MEMBER_WATCHDOG_NOTIFICATION_FAILED))
      }
      this.report(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
    }
  }

  report(message: string): void {
    try {
      this.observer.memberStartFailed(this.name, message)
    } catch (failure) {
      if (failure instanceof Error) {
        this.failures.push(failure)
      } else {
        this.failures.push(new Error(MEMBER_WATCHDOG_NOTIFICATION_FAILED))
      }
    }
  }

  operationalFailure(error: Error): void {
    this.failures.push(error)
    this.report(MEMBER_WATCHDOG_OPERATION_FAILED)
  }

  ensureHealthy(): void {
    if (this.failures.length > 0) {
      throw new AggregateError(this.failures, MEMBER_WATCHDOG_OPERATION_FAILED)
    }
  }
}
