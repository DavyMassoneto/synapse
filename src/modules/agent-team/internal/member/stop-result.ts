import { MEMBER_STOP_MESSAGES } from "./constants"
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
      this.notification.deliver(MEMBER_STOP_MESSAGES[outcome])
      if (this.member.isCurrentExecution(executionId)) {
        this.member.finishStop(outcome)
      }
    }
  }
}
