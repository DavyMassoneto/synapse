import { type Theme } from "@earendil-works/pi-coding-agent"
import { type Component, Container, TruncatedText, type TUI } from "@earendil-works/pi-tui"
import { TEAM_PANEL_PADDING_X, TEAM_PANEL_PADDING_Y, TEAM_PANEL_TONE_COLORS } from "./constants"
import { type TeamPanelLine } from "./types"

export class TeamPanel {
  private readonly lines: TeamPanelLine[]

  constructor(lines: TeamPanelLine[]) {
    this.lines = lines
  }

  build(_tui: TUI, theme: Theme): Component {
    const panel = new Container()
    for (const line of this.lines) {
      panel.addChild(
        new TruncatedText(
          theme.fg(TEAM_PANEL_TONE_COLORS[line.tone], line.text),
          TEAM_PANEL_PADDING_X,
          TEAM_PANEL_PADDING_Y,
        ),
      )
    }
    return panel
  }
}
