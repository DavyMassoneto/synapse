import { type Advisor } from "@/modules";
import { registerCommand } from "./command.ts";
import { registerEvents } from "./events.ts";
import { type AdvisorHost } from "./host-types.ts";
import { registerTool } from "./tool.ts";

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
