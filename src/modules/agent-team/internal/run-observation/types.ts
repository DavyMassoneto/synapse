import { type TeamObservedSignal } from "#synapse/modules/agent-team/public/contracts"

export interface ObservedTime {
  timestamp: string
  monotonic: number
}

export interface ObservedTool {
  name: string
  started: number
}

export type ObservedTools = Map<string, ObservedTool>

export interface ObservedRun {
  executionId: number
  started: ObservedTime
  last: ObservedTime
  ended?: ObservedTime
  signal: TeamObservedSignal
  turns: number
  completedTools: number
  streamUpdates: number
}
