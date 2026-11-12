import { type GithubConfiguration } from "#evaluator/configuration"
import { getJson } from "#evaluator/github-rest-client"
import { pullPath } from "./pull-path"
import { PullSchema } from "./schemas"

export async function currentHeadSha(configuration: GithubConfiguration): Promise<string> {
  const pull = await getJson(configuration, pullPath(configuration), PullSchema)
  return pull.head.sha
}
