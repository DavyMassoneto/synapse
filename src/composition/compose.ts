import { homedir } from "node:os";
import { join } from "node:path";
import { createAdvisor } from "#synapse/modules";
import { type AdvisorLifecycle, type AdvisorRegistrationPort } from "./types.ts";

export function compose(
  host: AdvisorRegistrationPort,
  configPath = join(homedir(), ".pi", "agent", "advisor.json"),
): void {
  const controller = new AbortController();
  const lifecycle: AdvisorLifecycle = {
    signal: controller.signal,
    shutdown: controller.abort.bind(controller),
  };
  host.register(createAdvisor(configPath), lifecycle);
}
