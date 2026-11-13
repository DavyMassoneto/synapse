import { type Static } from "typebox"
import { type SCRIPTED_PROVIDER_SCRIPT_SCHEMA } from "./schemas"

export type ScriptedProviderScript = Static<typeof SCRIPTED_PROVIDER_SCRIPT_SCHEMA>

export type ScriptedProviderStep = ScriptedProviderScript[number]

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
