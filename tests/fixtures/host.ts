import { rmSync } from "node:fs";
import { join } from "node:path";
import { registerAdvisor } from "#synapse/integration";
import { type Advisor, createAdvisor } from "#synapse/modules";
import { AdvisorHostCollector } from "./host-collector";

export class TypedAdvisorHost extends AdvisorHostCollector {
  readonly lifetime = new AbortController();
  readonly advisor: Advisor;

  constructor(readonly directory: string) {
    super();
    try {
      this.advisor = createAdvisor(join(directory, "advisor.json"));
      registerAdvisor(
        this,
        this.advisor,
        this.lifetime.signal,
        this.lifetime.abort.bind(this.lifetime),
      );
    } catch (error) {
      rmSync(directory, { recursive: true, force: true });
      throw error;
    }
  }

  cleanup(): void {
    rmSync(this.directory, { recursive: true, force: true });
  }
}
