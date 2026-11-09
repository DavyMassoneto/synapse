import { readGithubConfiguration } from "./read-github-configuration"
import { readModelConfiguration } from "./read-model-configuration"
import { type Configuration } from "./types"

export function readConfiguration(): Configuration {
  return { github: readGithubConfiguration(), model: readModelConfiguration() }
}
