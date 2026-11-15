import { type ChildProcess } from "node:child_process"
import { type PassThrough } from "node:stream"
import { type SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { type TaskBoard } from "../internal"
import { type AgentTeam, type TeamStartOutcome } from "../public"
import { type TaskTestJournal, type TeamTestLead, type TeamTestSessions } from "./doubles"
import { type ShellWireTestOwner } from "./shell-wire-support"

export interface TaskTestSut {
  board: TaskBoard
  journal: TaskTestJournal
}

export interface TeamTestSut {
  team: AgentTeam
  lead: TeamTestLead
  sessions: TeamTestSessions
}

export interface TeamGenerationSut extends TeamTestSut {
  previousResult: TeamStartOutcome
  current: Promise<TeamStartOutcome>
}

export type ShellTestResolve = () => void
export type ShellTestReject = (error: Error) => void

export interface ShellWireScenario {
  lease: SupervisedWireLease
  owner: ShellWireTestOwner
  status: PassThrough
  output: PassThrough
  input: PassThrough
  channels: PassThrough[]
}

export type NativeTransportProcess = ChildProcess

export type NativeFixtureExitCode = number | null
