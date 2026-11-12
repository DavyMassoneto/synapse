import { TRANSPORT_FAILURE_PREFIX } from "./constants"

export class GithubTransportFailure extends Error {
  constructor(method: string, path: string) {
    super(`${TRANSPORT_FAILURE_PREFIX}${JSON.stringify(method)} ${JSON.stringify(path)}`)
  }
}
