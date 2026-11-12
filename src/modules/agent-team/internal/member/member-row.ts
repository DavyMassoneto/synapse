import {
  TEAM_INACTIVE,
  TEAM_MODEL_KNOWN,
  TEAM_RUNNING,
  TEAM_WAITING,
  TEAM_WORKING,
  type TeamAgentRow,
  type TeamAgentState,
} from "#synapse/modules/agent-team/public/contracts"
import { TEAM_ACTIVITY_BREAK, TEAM_UNCONFIRMED } from "./constants"
import { type TeamMemberRowInput } from "./types"

function memberRowState(input: TeamMemberRowInput): TeamAgentState {
  if (!input.busy) {
    return input.lastState
  }
  if (input.waiting) {
    return TEAM_WAITING
  }
  return TEAM_WORKING
}

function memberRowActivity(input: TeamMemberRowInput): string {
  if (!input.busy && input.unconfirmed > 0) {
    return `${TEAM_UNCONFIRMED}${input.unconfirmed}`
  }
  return Array.from(input.tools.values()).join(TEAM_ACTIVITY_BREAK)
}

export function teamMemberRow(input: TeamMemberRowInput): TeamAgentRow {
  const { opened, busy, presentation } = input
  const row: TeamAgentRow = {
    name: opened.record.name,
    description: opened.record.description,
    model: opened.record.model,
    status: busy ? TEAM_RUNNING : TEAM_INACTIVE,
    state: memberRowState(input),
    activity: memberRowActivity(input),
  }
  const model = presentation.effectiveModel
  if (model.kind === TEAM_MODEL_KNOWN) {
    row.effectiveModel = model.model
  }
  return row
}
