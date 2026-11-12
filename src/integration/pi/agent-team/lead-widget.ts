import { type TeamOverview } from "#synapse/modules"
import { TEAM_PI_TUI_MODE } from "./constants"
import { TeamPanel, type TeamPanelLine, teamPanelLines } from "./team-panel"
import { type AgentTeamContext, type TeamLeadWidgetContent } from "./types"

export function buildTeamLeadWidget(overview: TeamOverview, mode: AgentTeamContext["mode"]): TeamLeadWidgetContent {
  return teamLeadWidgetRepresentation(teamPanelLines(overview), mode)
}

function teamLeadWidgetRepresentation(lines: TeamPanelLine[], mode: AgentTeamContext["mode"]): TeamLeadWidgetContent {
  if (mode === TEAM_PI_TUI_MODE) {
    const panel = new TeamPanel(lines)
    return panel.build.bind(panel)
  }
  return lines.map((line) => line.text)
}
