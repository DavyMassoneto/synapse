import { type Cancelled } from "#synapse/modules"

export interface DisableCommand {
  kind: "disable"
}

export interface ThinkingCommand {
  kind: "thinking"
  level: string
}

export interface SelectCommand {
  kind: "select"
  query: string
}

export type AdvisorCommandInput = DisableCommand | ThinkingCommand | SelectCommand

export interface ModelSelected {
  kind: "selected"
  model: string
}

export interface AdvisorDisabled {
  kind: "disabled"
}

export type ModelSelection = ModelSelected | AdvisorDisabled | Cancelled
