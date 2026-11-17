import { type MemberTurnRuntime } from "#synapse/modules/agent-team/public/contracts"

export interface MemberWatchdogTarget {
  expired(executionId: number): void
}

export interface MemberWatchdogRunning {
  kind: "running"
  executionId: number
  updatedAt: number
}

interface MemberWatchdogIdle {
  kind: "idle"
}

export type MemberWatchdogState = MemberWatchdogRunning | MemberWatchdogIdle
export type MemberWatchdogRuntime = MemberTurnRuntime
