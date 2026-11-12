import { availableMemberModels, type MemberModelContext } from "../model-selection"
import { teamTextOutput } from "./tool-output"
import { type TeamModelToolUpdate, type TeamNoInput, type TeamToolOutput, type TeamWaitSignal } from "./types"

export async function listTeamModels(
  _id: string,
  _input: TeamNoInput,
  _signal: TeamWaitSignal,
  _update: TeamModelToolUpdate,
  context: MemberModelContext,
): Promise<TeamToolOutput> {
  return teamTextOutput(JSON.stringify(availableMemberModels(context)), false)
}
