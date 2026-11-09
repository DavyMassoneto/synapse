import { type Failure } from "../result"

export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max"

export interface Config {
  model?: string
  thinking: ThinkingLevel
}

export interface AdvisorConfigOperations {
  status(): AdvisorResult
  selectModel(model: string): AdvisorResult
  disable(): AdvisorResult
  setThinking(level: string): AdvisorResult
}

export interface AdvisorSuccess {
  kind: "success"
  config: Config
}

export type AdvisorResult = AdvisorSuccess | Failure
