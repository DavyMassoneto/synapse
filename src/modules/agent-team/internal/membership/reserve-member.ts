import { type StartMemberRequest } from "#synapse/modules/agent-team/public/contracts"
import { TeamRuleError } from "../operation-results"
import { type TeamRoster } from "../roster"
import { TEAM_MEMBERSHIP_CLOSED } from "./constants"

export function reserveTeamMember(request: StartMemberRequest, roster: TeamRoster, closed: boolean): string {
  if (closed) {
    throw new TeamRuleError(TEAM_MEMBERSHIP_CLOSED)
  }
  if (request.name) {
    return roster.reserve(request.name)
  }
  return roster.reserveDefault()
}
