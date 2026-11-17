import { MEMBER_WATCHDOG_NOTIFICATION_FAILED } from "../turn-watchdog"
import { type TeamMemberObserver } from "./types"

export class TeamMemberNotification {
  private failure?: Error

  private readonly name: string

  private readonly observer: TeamMemberObserver

  constructor(name: string, observer: TeamMemberObserver) {
    this.name = name
    this.observer = observer
  }

  deliver(message: string): void {
    try {
      this.observer.memberNotice(message)
    } catch {
      this.report(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
    }
  }

  report(message: string): void {
    try {
      this.observer.memberStartFailed(this.name, message)
    } catch (failure) {
      if (failure instanceof Error) {
        this.failure = failure
      } else {
        this.failure = new Error(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
      }
    }
  }

  ensureHealthy(): void {
    if (this.failure) {
      throw this.failure
    }
  }
}
