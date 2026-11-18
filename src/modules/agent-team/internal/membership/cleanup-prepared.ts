import {
  type MemberSessions,
  type OpenedMember,
  TEAM_ADMISSION_NOT_RECORDED,
} from "#synapse/modules/agent-team/public/contracts"
import { captureMemberOutcome } from "../member-outcome"
import { cleanupTeamAdmission } from "./cleanup-admission"
import { rollbackPreparedMember } from "./rollback"
import { type TeamAdmissionAttempt } from "./types"

export async function cleanupPreparedTeamAdmission(
  sessions: MemberSessions,
  opened: OpenedMember,
  attempt: TeamAdmissionAttempt,
): Promise<void> {
  if (!attempt.persistence || attempt.persistence === TEAM_ADMISSION_NOT_RECORDED) {
    attempt.outcome = await captureMemberOutcome(rollbackPreparedMember.bind(null, sessions, opened, attempt))
  } else {
    await cleanupTeamAdmission(opened, attempt)
  }
  if (attempt.outcome.failed) {
    throw attempt.outcome.error
  }
}
