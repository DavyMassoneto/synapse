import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerAdvisor } from "@/integration";
import { type HostPort } from "@/integration/host";
import { type Advisor } from "@/modules";

export class PiHost implements HostPort {
  constructor(private readonly pi: ExtensionAPI) {}

  register(advisor: Advisor, signal: AbortSignal, shutdown: () => void): void {
    registerAdvisor(this.pi, advisor, signal, shutdown);
  }
}
