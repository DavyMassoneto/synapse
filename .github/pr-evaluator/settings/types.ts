export interface GithubSettings {
  token: string
  repository: string
  pullNumber: number
  baseSha: string
  headSha: string
}

export interface ModelSettings {
  apiKey: string
  baseUrl: string
  model: string
}

export interface Settings {
  github: GithubSettings
  model: ModelSettings
}
