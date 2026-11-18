import { type TeamLead } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember } from "../member"
import { type MemberOutcomeAction } from "../member-outcome"
import { finishTeamClosings } from "./closing"

export async function teamSuspendMembers(
  members: TeamMember[],
  lead: TeamLead,
  previous: Promise<void>,
  acquisitions: Promise<void>,
): Promise<void> {
  const actions: MemberOutcomeAction[] = [previous, acquisitions]
  for (const member of members) {
    actions.push(teamSuspendMember.bind(null, member, lead))
  }
  await finishTeamClosings(actions)
}

export async function teamDisposeMembers(
  members: TeamMember[],
  previous: Promise<void>,
  acquisitions: Promise<void>,
): Promise<void> {
  const actions: MemberOutcomeAction[] = [previous, acquisitions]
  for (const member of members) {
    actions.push(member.dispose.bind(member))
  }
  await finishTeamClosings(actions)
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
