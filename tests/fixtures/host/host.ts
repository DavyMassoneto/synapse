import { rmSync } from "node:fs"
import { join } from "node:path"
import { registerAdvisor } from "#synapse/integration"
import { type Advisor, type Config, createAdvisor } from "#synapse/modules/advisor/public"
import { AdvisorHostCollector } from "./host-collector"

export class TypedAdvisorHost extends AdvisorHostCollector {
  readonly advisor: Advisor
  readonly directory: string

  constructor(directory: string) {
    super()
    this.directory = directory
    try {
      const lifetime = new AbortController()
      this.advisor = createAdvisor(join(directory, "advisor.json"))
      registerAdvisor(this, this.advisor, lifetime.signal, () => lifetime.abort())
    } catch (error) {
      rmSync(directory, { recursive: true, force: true })
      throw error
    }
  }

  requireConfig(): Config {
    const status = this.advisor.configuration.status()
    if (status.kind === "success") {
      return status.config
    }
    throw new Error(status.message)
  }

  cleanup(): void {
    rmSync(this.directory, { recursive: true, force: true })
  }
}
