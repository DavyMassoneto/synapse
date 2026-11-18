import { finishMemberOutcomes, type MemberOutcome } from "../member-outcome"
import { TEAM_ACQUISITION_CLEANUP_FAILED } from "./constants"
import { type TeamAcquisitionAction, type TeamAdmissionAttempt, type TeamPendingAcquisitions } from "./types"

export async function runTeamAcquisition<T>(
  pending: TeamPendingAcquisitions,
  action: TeamAcquisitionAction<T>,
): Promise<T> {
  const acquisition = Promise.withResolvers<MemberOutcome>()
  pending.add(acquisition)
  const attempt: TeamAdmissionAttempt = { outcome: { failed: false } }
  try {
    return await action(attempt)
  } finally {
    acquisition.resolve(attempt.outcome)
    if (!attempt.outcome.failed) {
      pending.delete(acquisition)
    }
  }
}

export async function finishTeamAcquisitions(pending: TeamPendingAcquisitions): Promise<void> {
  const attempts: Promise<MemberOutcome>[] = []
  for (const acquisition of pending) {
    attempts.push(acquisition.promise)
  }
  await finishMemberOutcomes(attempts, TEAM_ACQUISITION_CLEANUP_FAILED)
}
