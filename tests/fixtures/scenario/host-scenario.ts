import { TestContext } from "../context"
import { prepareHostDirectory, TypedAdvisorHost } from "../host"
import { type HostScenario } from "./types"

export function hostScenario(): HostScenario {
  return { host: new TypedAdvisorHost(prepareHostDirectory()), context: new TestContext() }
}
