import { type Static } from "typebox"
import { type InspectionSchema } from "./schemas"
export type InspectionRequest = Static<typeof InspectionSchema>
export interface InspectionContext {
  sha: string
  root: string
}
export interface GitEnvironment {
  PATH: NodeJS.ProcessEnv["PATH"]
  LANG: string
  GIT_CONFIG_NOSYSTEM: string
  GIT_CONFIG_GLOBAL: string
  GIT_ATTR_NOSYSTEM: string
  GIT_TERMINAL_PROMPT: string
}
