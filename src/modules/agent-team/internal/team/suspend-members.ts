import { type TeamLead } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember } from "../member"

export async function teamSuspendMembers(members: TeamMember[], lead: TeamLead): Promise<void> {
  await Promise.all(members.map((member) => teamSuspendMember(member, lead)))
}

async function teamSuspendMember(member: TeamMember, lead: TeamLead): Promise<void> {
  try {
    await member.suspend()
  } catch (error) {
    lead.reportFailure(member.name, String(error))
  }
}
