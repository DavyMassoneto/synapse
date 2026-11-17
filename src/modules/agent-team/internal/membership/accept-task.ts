import { type TaskSnapshot } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember } from "../member"
import { TEAM_ADMISSION_INSTRUCTIONS } from "./constants"

export function acceptMemberTask(member: TeamMember, task: TaskSnapshot): void {
  member.accept(`${TEAM_ADMISSION_INSTRUCTIONS}\n${JSON.stringify(task)}`)
}
