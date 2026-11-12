import { type GithubConfiguration } from "#evaluator/configuration"
import { getJson } from "#evaluator/github-rest-client"
import { PullSchema } from "./schemas"

export async function currentHeadSha(configuration: GithubConfiguration): Promise<string> {
  const pull = await getJson(
    configuration,
    `/repos/${configuration.repository}/pulls/${configuration.pullNumber}`,
    PullSchema,
  )
  return pull.head.sha
}
