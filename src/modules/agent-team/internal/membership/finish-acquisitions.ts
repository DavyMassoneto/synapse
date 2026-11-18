import { finishMemberOutcomes, type MemberOutcome } from "../member-outcome"
import { TEAM_ACQUISITION_CLEANUP_FAILED } from "./constants"
import { type TeamPendingAcquisitions } from "./types"

export async function finishTeamAcquisitions(pending: TeamPendingAcquisitions): Promise<void> {
  const attempts: Promise<MemberOutcome>[] = []
  for (const acquisition of pending) {
    attempts.push(acquisition.promise)
  }
  await finishMemberOutcomes(attempts, TEAM_ACQUISITION_CLEANUP_FAILED)
}
