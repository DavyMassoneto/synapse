export interface GithubConfiguration {
  token: string
  repository: string
  pullNumber: number
  baseSha: string
  headSha: string
}

export interface ModelConfiguration {
  apiKey: string
  baseUrl: string
  model: string
}

export interface Configuration {
  github: GithubConfiguration
  model: ModelConfiguration
}
