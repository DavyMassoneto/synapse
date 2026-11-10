import { type GithubConfiguration } from "#evaluator/configuration"

export function pullPath(configuration: GithubConfiguration): string {
  return `/repos/${configuration.repository}/pulls/${configuration.pullNumber}`
}
