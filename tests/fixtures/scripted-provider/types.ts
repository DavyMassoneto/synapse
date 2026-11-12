import { type Static } from "typebox"
import { type PI_PROCESS_SCRIPT_SCHEMA } from "./schemas"

export type PiProcessScript = Static<typeof PI_PROCESS_SCRIPT_SCHEMA>

export type PiProcessStep = PiProcessScript[number]

export interface PiProcessModelCost {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

export interface PiProcessModelDefinition {
  id: string
  name: string
  reasoning: boolean
  input: "text"[]
  cost: PiProcessModelCost
  contextWindow: number
  maxTokens: number
}
