export interface Rule {
  id: string
  label: string
}

export interface RuleGroup {
  text: string
  rules: Rule[]
}
