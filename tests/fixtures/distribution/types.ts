export interface InvalidConfigCase {
  name: string
  content: string
}

export interface VariableSet {
  kind: "set"
  value: string
}

export interface VariableUnset {
  kind: "unset"
}

export type SavedVariable = VariableSet | VariableUnset
