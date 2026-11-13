export interface RouterChosenProbabilityFound {
  kind: "found"
  probability: number
}

export interface RouterChosenProbabilityMissing {
  kind: "missing"
}

export type RouterChosenProbability = RouterChosenProbabilityFound | RouterChosenProbabilityMissing
