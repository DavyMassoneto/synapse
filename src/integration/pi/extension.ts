import { type HostPort } from "@/integration/host";
import { type AdvisorHost, registerAdvisor } from "@/integration/pi/advisor";
import { type Advisor } from "@/modules";

export class PiHost implements HostPort {
  constructor(private readonly pi: AdvisorHost) {}

  register(advisor: Advisor, signal: AbortSignal, shutdown: () => void): void {
    registerAdvisor(this.pi, advisor, signal, shutdown);
  }
}
