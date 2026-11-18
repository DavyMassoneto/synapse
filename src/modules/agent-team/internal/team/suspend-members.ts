import { type TeamLead } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember } from "../member"
import { captureMemberOutcome, finishMemberOutcomes } from "../member-outcome"
import { TEAM_SUSPENSION_FAILED } from "./constants"

export async function teamSuspendMembers(
  members: TeamMember[],
  lead: TeamLead,
  previous: Promise<void>,
  acquisitions: Promise<void>,
): Promise<void> {
  const attempts = [captureMemberOutcome(previous), captureMemberOutcome(acquisitions)]
  for (const member of members) {
    attempts.push(captureMemberOutcome(teamSuspendMember(member, lead)))
  }
  await finishMemberOutcomes(attempts, TEAM_SUSPENSION_FAILED)
}

export async function teamDisposeMembers(
  members: TeamMember[],
  previous: Promise<void>,
  acquisitions: Promise<void>,
): Promise<void> {
  const attempts = [captureMemberOutcome(previous), captureMemberOutcome(acquisitions)]
  for (const member of members) {
    attempts.push(captureMemberOutcome(member.dispose.bind(member)))
  }
  await finishMemberOutcomes(attempts, TEAM_SUSPENSION_FAILED)
}

async function teamSuspendMember(member: TeamMember, lead: TeamLead): Promise<void> {
  try {
    await member.suspend()
  } catch (error) {
    if (error instanceof Error) {
      lead.reportFailure(member.name, error.message)
    }
    throw error
  }
}
