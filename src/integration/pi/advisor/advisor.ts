import { type Advisor } from "@/modules";
import { registerCommand } from "./command";
import { registerEvents } from "./events";
import { type AdvisorHost } from "./host-types.ts";
import { registerTool } from "./tool";

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
