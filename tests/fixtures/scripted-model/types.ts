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
