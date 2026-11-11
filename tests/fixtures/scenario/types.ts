import { type TestContext } from "../context"
import { type TypedAdvisorHost } from "../host"

export interface HostScenario {
  host: TypedAdvisorHost
  context: TestContext
}
