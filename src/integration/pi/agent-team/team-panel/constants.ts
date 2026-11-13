import { TEAM_FAILED, TEAM_FINISHED, TEAM_IDLE, TEAM_INTERRUPTED, TEAM_WAITING, TEAM_WORKING } from "#synapse/modules"
import { type TeamPanelStateLabels, type TeamPanelToneColors } from "./types"

export const TEAM_PANEL_TITLE = "title"

export const TEAM_PANEL_ROW = "row"

export const TEAM_PANEL_EVENT = "event"

export const TEAM_PANEL_EMPTY = "Equipe · nenhum subagente (peça ao pi para usar subagentes)"

export const TEAM_PANEL_AGENT_TITLE = "Equipe"

export const TEAM_PANEL_TASK_TITLE = "Tarefas"

export const TEAM_PANEL_EVENTS_TITLE = "Últimos eventos"

export const TEAM_PANEL_INDENT = "  "

export const TEAM_PANEL_SEPARATOR = " · "

export const TEAM_PANEL_DESCRIPTION_SEPARATOR = " — "

export const TEAM_PANEL_MAX_AGENTS = 4

export const TEAM_PANEL_MAX_TASKS = 2

export const TEAM_PANEL_MAX_EVENTS = 3

export const TEAM_PANEL_MAX_LINE_LENGTH = 120

export const TEAM_PANEL_CONTROLS = /\p{Cc}+/gu

export const TEAM_PANEL_CONTROL_REPLACEMENT = " "

export const TEAM_PANEL_ELLIPSIS = "…"

export const TEAM_PANEL_PADDING_X = 1

export const TEAM_PANEL_PADDING_Y = 0

export const TEAM_PANEL_STATE_LABELS: TeamPanelStateLabels = {
  [TEAM_WORKING]: "● trabalhando",
  [TEAM_WAITING]: "◌ aguardando mensagem",
  [TEAM_IDLE]: "○ parado",
  [TEAM_FINISHED]: "✓ terminou o turno",
  [TEAM_INTERRUPTED]: "■ interrompido",
  [TEAM_FAILED]: "✗ falhou",
}

export const TEAM_PANEL_TONE_COLORS: TeamPanelToneColors = { title: "accent", row: "text", event: "dim" }
