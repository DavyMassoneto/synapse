import { type HostPort } from "@/integration/host";
import { createAdvisor } from "@/modules";

export function compose(host: HostPort, configPath: string): void {
  const lifetime = new AbortController();
  const advisor = createAdvisor(configPath);
  host.register(advisor, lifetime.signal, lifetime.abort.bind(lifetime));
}
