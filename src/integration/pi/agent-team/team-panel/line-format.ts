import {
  TEAM_PANEL_CONTROL_REPLACEMENT,
  TEAM_PANEL_CONTROLS,
  TEAM_PANEL_ELLIPSIS,
  TEAM_PANEL_MAX_LINE_LENGTH,
} from "./constants"
import { type TeamPanelLine, type TeamPanelTone } from "./types"

function sanitizeTeamPanelLine(text: string): string {
  return text.replace(TEAM_PANEL_CONTROLS, TEAM_PANEL_CONTROL_REPLACEMENT)
}

function truncateTeamPanelLine(cleaned: string): string {
  if (cleaned.length <= TEAM_PANEL_MAX_LINE_LENGTH) {
    return cleaned
  }
  let prefix = ""
  let count = 0
  for (const character of cleaned) {
    if (count === TEAM_PANEL_MAX_LINE_LENGTH) {
      return `${prefix}${TEAM_PANEL_ELLIPSIS}`
    }
    if (count < TEAM_PANEL_MAX_LINE_LENGTH - 1) {
      prefix += character
    }
    count++
  }
  return cleaned
}

export function panelLine(tone: TeamPanelTone, text: string): TeamPanelLine {
  return { tone, text: truncateTeamPanelLine(sanitizeTeamPanelLine(text)) }
}
