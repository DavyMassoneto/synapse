export interface CriterionLabels {
  "clean-code": string
  dry: string
  yagni: string
  srp: string
  performance: string
  architecture: string
}

export interface KindLabels {
  violation: string
  insufficient_context: string
}

export interface VerdictLabels {
  approve: string
  approve_with_remarks: string
  request_changes: string
}
