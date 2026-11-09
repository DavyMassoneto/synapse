export interface Rule {
  id: string
  label: string
}

export interface RuleGroup {
  name: string
  text: string
  rules: Rule[]
}
