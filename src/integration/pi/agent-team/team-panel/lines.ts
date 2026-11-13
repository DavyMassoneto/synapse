import { type TeamOverview } from "#synapse/modules"
import {
  TEAM_PANEL_AGENT_TITLE,
  TEAM_PANEL_EMPTY,
  TEAM_PANEL_EVENT,
  TEAM_PANEL_TASK_TITLE,
  TEAM_PANEL_TITLE,
} from "./constants"
import { panelLine } from "./line-format"
import { isEmptyTeamOverview } from "./predicates"
import { selectAgentLines, selectEventLines, selectTaskLines } from "./select-lines"
import { type TeamPanelLine } from "./types"

export function teamPanelLines(overview: TeamOverview): TeamPanelLine[] {
  if (isEmptyTeamOverview(overview)) {
    return [panelLine(TEAM_PANEL_EVENT, TEAM_PANEL_EMPTY)]
  }
  const lines = [panelLine(TEAM_PANEL_TITLE, TEAM_PANEL_AGENT_TITLE), ...selectAgentLines(overview.agents)]
  const open = selectTaskLines(overview.tasks)
  if (open.length) {
    lines.push(panelLine(TEAM_PANEL_TITLE, TEAM_PANEL_TASK_TITLE), ...open)
  }
  lines.push(...selectEventLines(overview.events))
  return lines
}
