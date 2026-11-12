export type InspectionAction = "files" | "read" | "search" | "history"
export interface InspectionRequest {
  action: InspectionAction
  path: string
  text: string
  startLine: number
  endLine: number
}
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
