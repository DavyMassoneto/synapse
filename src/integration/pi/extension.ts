import { type AdvisorLifecycle, type AdvisorRegistrationPort } from "#synapse/composition/index.js";
import { type AdvisorHost, registerAdvisor } from "#synapse/integration/pi/advisor/index.js";
import { type Advisor } from "#synapse/modules/index.js";

export class PiHost implements AdvisorRegistrationPort {
  constructor(private readonly pi: AdvisorHost) {}

  register(advisor: Advisor, lifecycle: AdvisorLifecycle): void {
    registerAdvisor(this.pi, advisor, lifecycle.signal, lifecycle.shutdown);
  }
}
