import { TEAM_REFUSED } from "#synapse/modules"
import { TEAM_TOOL_TEXT_CONTENT } from "./constants"
import { type TeamToolOutcome, type TeamToolOutput } from "./types"

export function teamTextOutput(text: string, isError: boolean): TeamToolOutput {
  return { content: [{ type: TEAM_TOOL_TEXT_CONTENT, text }], details: { text }, isError }
}

export function teamAcceptedOrRefusedOutput(outcome: TeamToolOutcome): TeamToolOutput {
  if (outcome.kind === TEAM_REFUSED) {
    return teamTextOutput(outcome.message, true)
  }
  return teamTextOutput(JSON.stringify(outcome), false)
}
