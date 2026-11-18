import { type AgentSession, type ExtensionError } from "@earendil-works/pi-coding-agent"
import { type AgentTeam } from "#synapse/modules/agent-team"
import { type TreeTransitionBarrier } from "./transition-barrier"

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
