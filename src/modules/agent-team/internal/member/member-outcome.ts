import {
  type MemberExecutionSettled,
  TEAM_FAILED,
  TEAM_FINISHED,
  TEAM_INTERRUPTED,
} from "#synapse/modules/agent-team/public/contracts"
import { TEAM_MEMBER_HAS_FAILURE, TEAM_NO_ANSWER } from "./constants"
import { type TeamMemberFailureState, type TeamMemberOutcome } from "./types"

export function teamMemberOutcome(event: MemberExecutionSettled, failure: TeamMemberFailureState): TeamMemberOutcome {
  if (event.aborted) {
    return { state: TEAM_INTERRUPTED, text: "" }
  }
  if (failure.kind === TEAM_MEMBER_HAS_FAILURE) {
    return { state: TEAM_FAILED, text: failure.message }
  }
  if (event.answer) {
    return { state: TEAM_FINISHED, text: event.answer }
  }
  return { state: TEAM_FINISHED, text: TEAM_NO_ANSWER }
}
