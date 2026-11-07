import type { Advisor } from "#synapse/modules";
import { AdvisorCommand } from "./command";
import type { AdvisorHost } from "./contracts";
import { AdvisorEvents } from "./events";
import { AdvisorToolHandler } from "./tool";

export function registerAdvisor(
  pi: AdvisorHost,
  advisor: Advisor,
  signal: AbortSignal,
  shutdown: () => void,
): void {
  AdvisorEvents.register(pi, advisor, shutdown);
  AdvisorToolHandler.register(pi, advisor, signal);
  AdvisorCommand.register(pi, advisor);
}
