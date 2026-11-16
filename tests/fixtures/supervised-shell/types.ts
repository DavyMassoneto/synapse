import { type ChildProcess } from "node:child_process"
import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { type MemberConfigFixture } from "../member-extension-config"
export type WindowsSentinel = ChildProcess | null

export interface SupervisedReloadFixture {
  fixture: MemberConfigFixture
  shell: SupervisedShellService
  session: AgentSession
  settingsFile: string
}
