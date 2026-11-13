import { type Static } from "typebox"
import {
  type SCRIPTED_PROVIDER_SCRIPT_SCHEMA,
  type SCRIPTED_PROVIDER_STEPS_SCHEMA,
  type SCRIPTED_PROVIDER_TRACKS_SCHEMA,
} from "./schemas"

export type ScriptedProviderScript = Static<typeof SCRIPTED_PROVIDER_SCRIPT_SCHEMA>

export type ScriptedProviderSteps = Static<typeof SCRIPTED_PROVIDER_STEPS_SCHEMA>

export type ScriptedProviderStep = ScriptedProviderSteps[number]

export type ScriptedProviderTracks = Static<typeof SCRIPTED_PROVIDER_TRACKS_SCHEMA>

export interface ScriptedProviderTrackSelected {
  kind: "selected"
  index: number
}

export interface ScriptedProviderTrackMissing {
  kind: "missing"
}

export type ScriptedProviderTrackSelection = ScriptedProviderTrackSelected | ScriptedProviderTrackMissing

export interface ScriptedProviderSelectedStep {
  step: ScriptedProviderStep
  id: string
}

export interface ScriptedProviderModelCost {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export interface ScriptedProviderModelDefinition {
  id: string
  name: string
  reasoning: boolean
  input: "text"[]
  cost: ScriptedProviderModelCost
  contextWindow: number
  maxTokens: number
}
