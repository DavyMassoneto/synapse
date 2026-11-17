import { type MemberSession } from "#synapse/modules/agent-team/public/contracts"
import { MEMBER_WATCHDOG_NOTICE, MEMBER_WATCHDOG_NOTIFICATION_FAILED } from "../turn-watchdog"
import { MEMBER_STOP_FAILED, MEMBER_STOP_REQUESTED } from "./constants"
import { type TeamMemberStopPolicy, type TeamMemberStopRequest } from "./types"

export function stopMemberTurn(session: MemberSession, policy: TeamMemberStopPolicy): void {
  const outcome = requestMemberStop(session, policy)
  deliverMemberStopNotice(policy)
  if (outcome === MEMBER_STOP_FAILED) {
    try {
      policy.unconfirmed()
    } catch {
      policy.failed(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
    }
  }
}

function requestMemberStop(session: MemberSession, policy: TeamMemberStopPolicy): TeamMemberStopRequest {
  try {
    session
      .abort()
      .then(policy.confirmed, policy.unconfirmed)
      .catch(policy.failed.bind(undefined, MEMBER_WATCHDOG_NOTIFICATION_FAILED))
    return MEMBER_STOP_REQUESTED
  } catch {
    return MEMBER_STOP_FAILED
  }
}

function deliverMemberStopNotice(policy: TeamMemberStopPolicy): void {
  try {
    policy.notice(MEMBER_WATCHDOG_NOTICE)
  } catch {
    policy.failed(MEMBER_WATCHDOG_NOTIFICATION_FAILED)
  }
}
