import { type ChildProcess } from "node:child_process"
import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { type MemberConfigFixture } from "../member-extension-config"
export type WindowsChannelExitCode = number | null
export type WindowsSentinel = ChildProcess | null

export interface WindowsNativeFaultCase {
  target: string
  expected: string
}

export interface SupervisedTestEnvironmentEntry {
  name: string
  value: string
}

export type WindowsFaultsResolve = (result: string) => void
export type WindowsFaultsReject = (error: Error) => void
export type WindowsFaultsError = Error | null

export interface SupervisedReloadFixture {
  fixture: MemberConfigFixture
  shell: SupervisedShellService
  session: AgentSession
  settingsFile: string
}
