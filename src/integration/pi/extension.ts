import { type AdvisorLifecycle, type AdvisorRegistrationPort } from "@/composition";
import { type AdvisorHost, registerAdvisor } from "@/integration/pi/advisor";
import { type Advisor } from "@/modules";

export class PiHost implements AdvisorRegistrationPort {
  constructor(private readonly pi: AdvisorHost) {}

  register(advisor: Advisor, lifecycle: AdvisorLifecycle): void {
    registerAdvisor(this.pi, advisor, lifecycle.signal, lifecycle.shutdown);
  }
}
