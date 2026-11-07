import type { AdvisorLifecycle, AdvisorRegistrationPort } from "#synapse/composition";
import { type AdvisorHost, registerAdvisor } from "#synapse/integration/pi/advisor";
import type { Advisor } from "#synapse/modules";

export class PiHost implements AdvisorRegistrationPort {
  constructor(private readonly pi: AdvisorHost) {}

  register(advisor: Advisor, lifecycle: AdvisorLifecycle): void {
    registerAdvisor(this.pi, advisor, lifecycle.signal, lifecycle.shutdown);
  }
}
