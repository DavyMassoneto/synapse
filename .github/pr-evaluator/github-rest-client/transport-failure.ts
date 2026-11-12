import { TRANSPORT_FAILURE_PREFIX } from "./constants"
import { type GithubMethod } from "./types"

export class GithubTransportFailure extends Error {
  constructor(method: GithubMethod, path: string) {
    super(`${TRANSPORT_FAILURE_PREFIX}${JSON.stringify(method)} ${JSON.stringify(path)}`)
  }
}
