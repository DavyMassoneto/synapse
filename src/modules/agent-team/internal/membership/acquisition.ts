import { type MemberOutcome } from "../member-outcome"
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
