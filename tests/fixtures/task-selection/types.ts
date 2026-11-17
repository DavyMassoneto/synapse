import { type Static } from "typebox"
import { type SELECTION_REQUESTS_SCHEMA } from "./schemas"

export type SelectionRequest = Static<typeof SELECTION_REQUESTS_SCHEMA>

export interface SelectionPaths {
  directory: string
  agentDirectory: string
  cwd: string
}

export interface SelectionRequestContext {
  selected: string
  external: boolean
}
