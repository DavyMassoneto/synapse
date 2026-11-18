import {
  type MemberSessions,
  type OpenedMember,
  TEAM_ADMISSION_NOT_RECORDED,
} from "#synapse/modules/agent-team/public/contracts"
import { captureMemberOutcome } from "../member-outcome"
import { TEAM_ADMISSION_MESSAGE_SEPARATOR } from "./constants"
import { type TeamAdmissionAttempt } from "./types"

export async function cleanupTeamAdmission(opened: OpenedMember, attempt: TeamAdmissionAttempt): Promise<void> {
  if (attempt.member) {
    attempt.outcome = await captureMemberOutcome(attempt.member.dispose.bind(attempt.member))
  } else {
    attempt.outcome = await captureMemberOutcome(opened.session.dispose.bind(opened.session))
  }
}

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

export async function rollbackPreparedMember(
  sessions: MemberSessions,
  opened: OpenedMember,
  attempt: TeamAdmissionAttempt,
): Promise<void> {
  await cleanupTeamAdmission(opened, attempt)
  const closed = attempt.outcome
  const discarded = await captureMemberOutcome(sessions.discardPrepared.bind(sessions, opened.record))
  const failures: Error[] = []
  if (closed.failed) {
    failures.push(closed.error)
  }
  if (discarded.failed) {
    failures.push(discarded.error)
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, failures.join(TEAM_ADMISSION_MESSAGE_SEPARATOR))
  }
}
