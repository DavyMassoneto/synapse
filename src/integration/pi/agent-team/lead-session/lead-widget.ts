import { TeamPanel, type TeamPanelLine } from "../team-panel"
import { TEAM_PI_TUI_MODE } from "./constants"
import { type AgentTeamContext, type TeamLeadWidgetContent } from "./types"

export function teamLeadWidgetRepresentation(
  lines: TeamPanelLine[],
  mode: AgentTeamContext["mode"],
): TeamLeadWidgetContent {
  if (mode === TEAM_PI_TUI_MODE) {
    const panel = new TeamPanel(lines)
    return panel.build.bind(panel)
  }
  return lines.map((line) => line.text)
}
