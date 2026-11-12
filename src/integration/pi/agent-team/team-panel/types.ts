import { type ThemeColor } from "@earendil-works/pi-coding-agent"
import { TEAM_FAILED, TEAM_FINISHED, TEAM_IDLE, TEAM_INTERRUPTED, TEAM_WAITING, TEAM_WORKING } from "#synapse/modules"

export type TeamPanelTone = "title" | "row" | "event"

export interface TeamPanelLine {
  tone: TeamPanelTone
  text: string
}

export interface TeamPanelStateLabels {
  [TEAM_WORKING]: string
  [TEAM_WAITING]: string
  [TEAM_IDLE]: string
  [TEAM_FINISHED]: string
  [TEAM_INTERRUPTED]: string
  [TEAM_FAILED]: string
}

export interface TeamPanelToneColors {
  title: ThemeColor
  row: ThemeColor
  event: ThemeColor
}
