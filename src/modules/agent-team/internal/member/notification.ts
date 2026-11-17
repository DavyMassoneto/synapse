import { MEMBER_WATCHDOG_NOTIFICATION_FAILED, MEMBER_WATCHDOG_OPERATION_FAILED } from "../turn-watchdog"
import { captureMemberNotification } from "./capture-notification"
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
    const outcome = captureMemberNotification(this.observer.memberNotice.bind(this.observer, message))
    if (outcome.failed) {
      this.failures.push(outcome.error)
      this.report(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
    }
  }

  report(message: string): void {
    const outcome = captureMemberNotification(this.observer.memberStartFailed.bind(this.observer, this.name, message))
    if (outcome.failed) {
      this.failures.push(outcome.error)
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
