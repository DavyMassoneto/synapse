import { TEAM_FAILED, TEAM_INACTIVE, type TeamAgentRow } from "#synapse/modules/agent-team/public/contracts"
import { RUN_OBSERVATION_UNKNOWN } from "../run-observation"
import { type TeamFailedMember } from "./types"

export function failedMemberRow(failure: TeamFailedMember): TeamAgentRow {
  return {
    name: failure.record.name,
    description: failure.record.description,
    model: failure.record.model,
    status: TEAM_INACTIVE,
    state: TEAM_FAILED,
    activity: failure.message,
    restorationFailed: true,
    progress: { kind: RUN_OBSERVATION_UNKNOWN },
  }
}
