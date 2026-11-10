export interface ConfigCase {
  name: string
  content?: string
  expected: RegExp
  invalid?: boolean
}

export interface VariableSet {
  kind: "set"
  value: string
}

export interface VariableUnset {
  kind: "unset"
}

export type SavedVariable = VariableSet | VariableUnset

export interface DistributionResult {
  notices: string[]
  lookups: number
  isError: boolean
}
