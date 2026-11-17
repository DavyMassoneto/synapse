import { type ToolCall } from "@earendil-works/pi-ai"
import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type MemberRecord, type SupervisedShellService } from "#synapse/modules/agent-team"

export interface WatchdogAcquisitionCleanup {
  shell: SupervisedShellService
  session?: AgentSession
  lifecycleStarting: boolean
}

export interface WatchdogTimer {
  at: number
  callback: WatchdogTimerCallback
  cancelled: boolean
}

type WatchdogTimerCallback = () => void
export type WatchdogToolCall = ToolCall
export type WatchdogStartWait = () => Promise<void>
export type WatchdogAgentSessions = AgentSession[]
export type WatchdogCondition = () => boolean
export interface WatchdogFixtureOptions {
  shell: boolean
  failStop: boolean
}
export type WatchdogTimers = WatchdogTimer[]
export type WatchdogRecords = MemberRecord[]
