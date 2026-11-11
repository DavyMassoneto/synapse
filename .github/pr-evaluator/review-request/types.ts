export interface ReviewInput {
  diff: string
  source: string
}

export interface PromptContext {
  template: string
  architecture: string
  rules: string
  standards: string
}
