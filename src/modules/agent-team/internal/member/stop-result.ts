import { MEMBER_WATCHDOG_CONFIRMED, MEMBER_WATCHDOG_UNCONFIRMED } from "../turn-watchdog"
import { type TeamMemberNotification } from "./notification"
import { type TeamMemberStopResultPort } from "./types"

export class TeamMemberStopResult {
  private readonly member: TeamMemberStopResultPort

  private readonly notification: TeamMemberNotification

  constructor(member: TeamMemberStopResultPort, notification: TeamMemberNotification) {
    this.member = member
    this.notification = notification
  }

  confirmed(executionId: number): void {
    if (this.member.accepts(executionId)) {
      this.notification.deliver(MEMBER_WATCHDOG_CONFIRMED)
      if (this.member.accepts(executionId)) {
        this.member.finishStop(false)
      }
    }
  }

  unconfirmed(executionId: number): void {
    if (this.member.accepts(executionId)) {
      this.notification.deliver(MEMBER_WATCHDOG_UNCONFIRMED)
      if (this.member.accepts(executionId)) {
        this.member.finishStop(true)
      }
    }
  }
}
