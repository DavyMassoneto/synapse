import { type OpenedMember } from "#synapse/modules/agent-team/public/contracts"
import { captureMemberOutcome } from "../member-outcome"
import { type TeamAdmissionAttempt } from "./types"

export async function cleanupTeamAdmission(opened: OpenedMember, attempt: TeamAdmissionAttempt): Promise<void> {
  if (attempt.member) {
    attempt.outcome = await captureMemberOutcome(attempt.member.dispose.bind(attempt.member))
  } else {
    attempt.outcome = await captureMemberOutcome(opened.session.dispose.bind(opened.session))
  }
}
