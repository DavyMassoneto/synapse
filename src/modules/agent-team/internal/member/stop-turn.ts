import { type MemberSession } from "#synapse/modules/agent-team/public/contracts"
import { captureShellCleanup } from "../supervised-shell"
import { MEMBER_WATCHDOG_NOTICE } from "../turn-watchdog"
import { MEMBER_STOP_FAILED, MEMBER_STOP_REQUESTED } from "./constants"
import { type TeamMemberStopPolicy, type TeamMemberStopRequest } from "./types"

export function stopMemberTurn(session: MemberSession, policy: TeamMemberStopPolicy): void {
  const outcome = requestMemberStop(session, policy)
  policy.notice(MEMBER_WATCHDOG_NOTICE)
  if (outcome === MEMBER_STOP_FAILED) {
    observeStopOutcome(policy.unconfirmed, policy)
  }
}

function requestMemberStop(session: MemberSession, policy: TeamMemberStopPolicy): TeamMemberStopRequest {
  try {
    session
      .abort()
      .then(
        observeStopOutcome.bind(undefined, policy.confirmed, policy),
        observeStopOutcome.bind(undefined, policy.unconfirmed, policy),
      )
    return MEMBER_STOP_REQUESTED
  } catch {
    return MEMBER_STOP_FAILED
  }
}

async function observeStopOutcome(
  action: TeamMemberStopPolicy["confirmed"],
  policy: TeamMemberStopPolicy,
): Promise<void> {
  const outcome = await captureShellCleanup(action)
  if (outcome.failed) {
    policy.failed(outcome.error)
  }
}
