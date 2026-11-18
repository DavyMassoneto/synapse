import {
  captureMemberOutcome,
  finishMemberOutcomes,
  type MemberOutcome,
  type MemberOutcomeAction,
} from "../member-outcome"
import { TEAM_SUSPENSION_FAILED } from "./constants"

export async function finishTeamClosings(actions: MemberOutcomeAction[]): Promise<void> {
  const attempts: Promise<MemberOutcome>[] = []
  for (const action of actions) {
    attempts.push(captureMemberOutcome(action))
  }
  await finishMemberOutcomes(attempts, TEAM_SUSPENSION_FAILED)
}
