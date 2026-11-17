import { type MemberSession } from "#synapse/modules/agent-team/public/contracts"
import { MEMBER_WATCHDOG_NOTICE, MEMBER_WATCHDOG_NOTIFICATION_FAILED } from "../turn-watchdog"
import { type TeamMemberStopPolicy } from "./types"

export function stopMemberTurn(session: MemberSession, policy: TeamMemberStopPolicy): void {
  let failed = false
  try {
    session
      .abort()
      .then(policy.confirmed, policy.unconfirmed)
      .catch(policy.failed.bind(undefined, MEMBER_WATCHDOG_NOTIFICATION_FAILED))
  } catch {
    failed = true
  }
  try {
    policy.notice?.(MEMBER_WATCHDOG_NOTICE)
  } catch {
    policy.failed(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
  }
  if (failed) {
    try {
      policy.unconfirmed()
    } catch {
      policy.failed(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
    }
  }
}
