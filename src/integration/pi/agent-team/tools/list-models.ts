import { availableMemberModels, type MemberModelContext } from "../model-selection"
import { teamTextOutput } from "./tool-output"
import { type TeamModelToolSignal, type TeamModelToolUpdate, type TeamNoInput, type TeamToolOutput } from "./types"

export async function listTeamModels(
  _id: string,
  _input: TeamNoInput,
  _signal: TeamModelToolSignal,
  _update: TeamModelToolUpdate,
  context: MemberModelContext,
): Promise<TeamToolOutput> {
  return teamTextOutput(JSON.stringify(availableMemberModels(context)), false)
}
