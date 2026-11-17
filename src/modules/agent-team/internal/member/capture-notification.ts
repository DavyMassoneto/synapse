import { type MemberOutcome } from "../member-outcome"
import { MEMBER_WATCHDOG_NOTIFICATION_FAILED } from "../turn-watchdog"
import { type TeamMemberNotificationAction } from "./types"

export function captureMemberNotification(action: TeamMemberNotificationAction): MemberOutcome {
  try {
    action()
    return { failed: false }
  } catch (failure) {
    if (failure instanceof Error) {
      return { failed: true, error: failure }
    }
    return { failed: true, error: new Error(MEMBER_WATCHDOG_NOTIFICATION_FAILED) }
  }
}
