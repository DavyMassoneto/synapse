import { type OpenedMember } from "#synapse/modules/agent-team/public/contracts"
import { TeamMember } from "../member"
import { cleanupTeamAdmission } from "./cleanup-admission"
import { TEAM_ACQUISITION_CLEANUP_FAILED } from "./constants"
import { type TeamAdmissionAttempt, type TeamRestoredAdmission } from "./types"

export async function admitRestoredTeamMember(
  opened: OpenedMember,
  attempt: TeamAdmissionAttempt,
  admission: TeamRestoredAdmission,
): Promise<void> {
  try {
    admission.validateGeneration()
    const member = new TeamMember(opened, admission.observer, admission.runtime, admission.clock)
    attempt.member = member
    admission.validateGeneration()
    admission.roster.add(member)
  } catch (error) {
    await cleanupTeamAdmission(opened, attempt)
    if (attempt.outcome.failed) {
      throw new AggregateError([error, attempt.outcome.error], TEAM_ACQUISITION_CLEANUP_FAILED)
    }
    throw error
  }
}
