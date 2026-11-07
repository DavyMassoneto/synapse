import { type Advisor } from "#synapse/modules/index.js";
import { registerCommand } from "./command/index.js";
import { registerEvents } from "./events/index.js";
import { type AdvisorHost } from "./host-types.ts";
import { registerTool } from "./tool/index.js";

export function registerAdvisor(
  pi: AdvisorHost,
  advisor: Advisor,
  signal: AbortSignal,
  shutdown: () => void,
): void {
  registerEvents(pi, advisor, shutdown);
  registerTool(pi, advisor, signal);
  registerCommand(pi, advisor);
}
