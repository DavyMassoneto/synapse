export interface ConfigCase {
  name: string
  content?: string
  expected: RegExp
  invalid?: boolean
}

export interface DistributionResult {
  notices: string[]
  lookups: number
  isError: boolean
}
