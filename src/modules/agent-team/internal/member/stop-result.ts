import { MEMBER_WATCHDOG_CONFIRMED, MEMBER_WATCHDOG_UNCONFIRMED } from "../turn-watchdog"
import { MEMBER_STOP_CONFIRMED } from "./constants"
import { type TeamMemberNotification } from "./notification"
import { type TeamMemberStopOutcome, type TeamMemberStopResultPort } from "./types"

export class TeamMemberStopResult {
  private readonly member: TeamMemberStopResultPort

  private readonly notification: TeamMemberNotification

  constructor(member: TeamMemberStopResultPort, notification: TeamMemberNotification) {
    this.member = member
    this.notification = notification
  }

  finish(executionId: number, outcome: TeamMemberStopOutcome): void {
    if (this.member.isCurrentExecution(executionId)) {
      let message = MEMBER_WATCHDOG_UNCONFIRMED
      if (outcome === MEMBER_STOP_CONFIRMED) {
        message = MEMBER_WATCHDOG_CONFIRMED
      }
      this.notification.deliver(message)
      if (this.member.isCurrentExecution(executionId)) {
        this.member.finishStop(outcome)
      }
    }
  }
}
