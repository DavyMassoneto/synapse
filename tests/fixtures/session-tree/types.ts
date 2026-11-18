import { type TreeTransitionBarrier } from "./transition-barrier"

export interface TreeArbitraryFailure {
  failure: string
}

export type TreeCleanupThrow = Error | string | number | boolean | TreeArbitraryFailure

export type TreeAcquisitionPhase = "before" | "after"

export type TreeTransitionAction = "navigate" | "shutdown" | "reload"

export type TreeAcquisitionKind = "open" | "reopen"

export type TreeAcquisitionTarget = "settings" | "script"

export interface TreeTransitionState {
  barrier?: TreeTransitionBarrier
}

export interface TreeSettings {
  extensions: string[]
  defaultProvider: string
  defaultModel: string
}
