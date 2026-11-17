import { type MemberSessions, type OpenedMember } from "#synapse/modules/agent-team/public/contracts"
import { captureMemberOutcome } from "../member-outcome"
import { TEAM_ADMISSION_MESSAGE_SEPARATOR } from "./constants"
import { type TeamAdmissionAttempt } from "./types"

export async function rollbackPreparedMember(
  sessions: MemberSessions,
  opened: OpenedMember,
  attempt: TeamAdmissionAttempt,
): Promise<void> {
  let close = opened.session.dispose.bind(opened.session)
  if (attempt.member) {
    close = attempt.member.dispose.bind(attempt.member)
  }
  const closed = await captureMemberOutcome(close)
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
