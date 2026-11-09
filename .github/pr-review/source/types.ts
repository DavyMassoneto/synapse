export interface Source {
  path: string
  text: string
  incomplete: boolean
}

export interface TruncatedText {
  text: string
  truncated: boolean
}

export type OptionalLines = string[] | undefined
