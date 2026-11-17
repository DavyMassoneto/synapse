import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type MemberRecord } from "#synapse/modules/agent-team"

export interface WatchdogTimer {
  at: number
  callback: WatchdogTimerCallback
  cancelled: boolean
}

export type WatchdogTimerCallback = () => void
export type WatchdogAgentSessions = AgentSession[]
export type WatchdogCondition = () => boolean
export type WatchdogTimers = WatchdogTimer[]
export type WatchdogRecords = MemberRecord[]
