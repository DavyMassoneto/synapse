export interface PromptContext {
  template: string
  architecture: string
  rules: string
  standards: string
}

export interface PlaceholderTexts {
  "{{ARQUITETURA}}": string
  "{{REGRAS}}": string
  "{{PADROES}}": string
  "{{DIFF}}": string
}

export type Placeholder = keyof PlaceholderTexts
