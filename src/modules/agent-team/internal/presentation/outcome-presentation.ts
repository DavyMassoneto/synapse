import { TEAM_FAILED, TEAM_INTERRUPTED } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMemberOutcome } from "../member"
import {
  TEAM_EVENT_FAILED,
  TEAM_EVENT_FINISHED,
  TEAM_EVENT_INTERRUPTED,
  TEAM_NOTICE_AGENT,
  TEAM_NOTICE_FAILED,
  TEAM_NOTICE_FINISHED,
  TEAM_NOTICE_INTERRUPTED,
  TEAM_OUTCOME_EVENT_DETAIL,
} from "./constants"
import { type TeamOutcomePresentation } from "./types"

export function teamOutcomePresentation(name: string, outcome: TeamMemberOutcome): TeamOutcomePresentation {
  if (outcome.state === TEAM_INTERRUPTED) {
    return {
      event: `${name}${TEAM_EVENT_INTERRUPTED}`,
      notice: `${TEAM_NOTICE_AGENT}${name}${TEAM_NOTICE_INTERRUPTED}`,
    }
  }
  if (outcome.state === TEAM_FAILED) {
    return {
      event: `${name}${TEAM_EVENT_FAILED}${TEAM_OUTCOME_EVENT_DETAIL}${outcome.text}`,
      notice: `${TEAM_NOTICE_AGENT}${name}${TEAM_NOTICE_FAILED}${outcome.text}`,
    }
  }
  return {
    event: `${name}${TEAM_EVENT_FINISHED}${TEAM_OUTCOME_EVENT_DETAIL}${outcome.text}`,
    notice: `${TEAM_NOTICE_AGENT}${name}${TEAM_NOTICE_FINISHED}${outcome.text}`,
  }
}
