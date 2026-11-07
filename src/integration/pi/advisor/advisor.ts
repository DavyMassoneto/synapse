import { type AdvisorHost } from "#synapse/integration/pi/advisor/contracts";
import { type Advisor } from "#synapse/modules";
import { AdvisorCommand } from "./command/index.js";
import { AdvisorEvents } from "./events/index.js";
import { AdvisorToolHandler } from "./tool/index.js";

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
