import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { type MemberConfigFixture } from "../member-extension-config"
export type WindowsChannelResolve = (code: number) => void
export type WindowsChannelReject = (error: Error) => void
export type WindowsChannelExitCode = number | null

export interface SupervisedTestEnvironmentEntry {
  name: string
  value: string
}

export type WindowsFaultsResolve = (result: string) => void
export type WindowsFaultsReject = (error: Error) => void
export type WindowsFaultsError = Error | null

export type CancelledResultResolve = () => void
export type CancelledResultCodeResolve = (code: number) => void

export interface SupervisedReloadFixture {
  fixture: MemberConfigFixture
  shell: SupervisedShellService
  session: AgentSession
  settingsFile: string
}
