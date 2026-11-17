import { type ToolCall } from "@earendil-works/pi-ai"
import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type TeamMemberExtensionLifecycle } from "#synapse/integration/pi/agent-team"
import { type MemberRecord } from "#synapse/modules/agent-team"

import { type WatchdogTrackedShell } from "./tracked-shell"

export interface WatchdogAcquisitionCleanup {
  shell: WatchdogTrackedShell
  session?: AgentSession
  lifecycle?: TeamMemberExtensionLifecycle
  lifecycleStarting: boolean
}

export interface WatchdogTimer {
  at: number
  callback: WatchdogTimerCallback
  cancelled: boolean
}

type WatchdogTimerCallback = () => void
export type WatchdogFailure = Error | null
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
export type WatchdogTrackedShells = WatchdogTrackedShell[]
