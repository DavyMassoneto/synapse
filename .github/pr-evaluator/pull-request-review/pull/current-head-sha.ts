import { type GithubConfiguration } from "#evaluator/configuration"
import { getJson } from "../api"
import { PullSchema } from "./constants"
import { pullPath } from "./pull-path"

export async function currentHeadSha(configuration: GithubConfiguration): Promise<string> {
  const pull = await getJson(configuration, pullPath(configuration), PullSchema)
  return pull.head.sha
}
