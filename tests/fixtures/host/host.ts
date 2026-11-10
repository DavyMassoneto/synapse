import { rmSync } from "node:fs"
import { join } from "node:path"
import { compose } from "#synapse/composition"
import { type Advisor, type Config } from "#synapse/modules/advisor/public"
import { AdvisorHostCollector } from "./host-collector"

export class TypedAdvisorHost extends AdvisorHostCollector {
  readonly advisor: Advisor
  readonly signal: AbortSignal
  readonly directory: string

  constructor(directory: string) {
    super()
    this.directory = directory
    try {
      const composition = compose(this, join(directory, "advisor.json"))
      this.advisor = composition.advisor
      this.signal = composition.signal
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
