import { type AgentSession, type ExtensionError } from "@earendil-works/pi-coding-agent"
import {
  type AgentTeam,
  type MemberRecord,
  type OpenedMember,
  type OpenMemberRequest,
} from "#synapse/modules/agent-team"
import { type TreeTransitionBarrier } from "./transition-barrier"

export interface TreeCleanupErrors {
  suspendError: Error
  disposeError: Error
  removeError: Error
}

export type TreeCleanupOracle = (fault: TreeCleanupErrors, closing: Promise<void>) => Promise<void>

export interface TreeCleanupScenario {
  disposeFails: boolean
  removeFails: boolean
  verify: TreeCleanupOracle
}

export interface TreeArbitraryFailure {
  failure: string
}

export interface TreeDefaultCleanupThrow {
  kind: "default"
}

export interface TreeExplicitCleanupThrow {
  kind: "explicit"
  value: TreeCleanupThrow
}

export type TreeExplicitCleanupFailure = Error | string

export type TreeCleanupThrowOption = TreeDefaultCleanupThrow | TreeExplicitCleanupThrow

export type TreeCleanupThrow = Error | string | number | boolean | TreeArbitraryFailure

export type TreeAcquisitionRequest = OpenMemberRequest | MemberRecord

export type TreeAcquisitionAction<T extends TreeAcquisitionRequest> = (
  request: T,
  team: AgentTeam,
) => Promise<OpenedMember>

export type TreeAcquisitionPhase = "before" | "after"

export type TreeTransitionAction = "navigate" | "shutdown" | "reload"

export type TreeAcquisitionKind = "open" | "reopen"

export type TreeAcquisitionTarget = "settings" | "script"

export interface TreeAcquisitionFixtureView {
  directory: string
  errors: ExtensionError[]
  board(): AgentTeam
}

export interface TreeAcquisitionGate {
  release(): void
  close(): void
}

export interface TreeAcquisitionScenario {
  fixture: TreeAcquisitionFixtureView
  session: AgentSession
  root: string
  branch: string
  gate: TreeAcquisitionGate
  previous: Promise<void>
  navigation: ReturnType<AgentSession["navigateTree"]>
  probeBefore: string
}

export interface TreeTransitionState {
  barrier?: TreeTransitionBarrier
}

export interface TreeSettings {
  extensions: string[]
  defaultProvider: string
  defaultModel: string
}
