import {
  TEAM_IDLE,
  TEAM_INACTIVE,
  TEAM_LEAD_NAME,
  TEAM_MODEL_KNOWN,
  TEAM_RUNNING,
  TEAM_WAITING,
  TEAM_WORKING,
  type TeamAgentRow,
  type TeamLead,
} from "#synapse/modules/agent-team/public/contracts"
import { TEAM_LEAD_DESCRIPTION, TEAM_LEAD_MODEL_UNAVAILABLE } from "./constants"

export function teamLeadRow(lead: TeamLead, waiting: boolean): TeamAgentRow {
  const models = lead.modelUse()
  const row: TeamAgentRow = {
    name: TEAM_LEAD_NAME,
    description: TEAM_LEAD_DESCRIPTION,
    activity: "",
    model: TEAM_LEAD_MODEL_UNAVAILABLE,
    status: TEAM_INACTIVE,
    state: TEAM_IDLE,
  }
  if (models.model.kind === TEAM_MODEL_KNOWN) {
    row.model = models.model.model
  }
  if (models.effectiveModel.kind === TEAM_MODEL_KNOWN) {
    row.effectiveModel = models.effectiveModel.model
  }
  if (waiting) {
    return { ...row, status: TEAM_RUNNING, state: TEAM_WAITING }
  }
  if (lead.isRunning()) {
    return { ...row, status: TEAM_RUNNING, state: TEAM_WORKING }
  }
  return row
}
