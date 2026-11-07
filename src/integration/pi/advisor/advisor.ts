import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { type Advisor } from "@/modules";
import { registerCommand } from "./command.ts";
import { registerEvents } from "./events.ts";
import { registerTool } from "./tool.ts";

export function registerAdvisor(
  pi: ExtensionAPI,
  advisor: Advisor,
  signal: AbortSignal,
  shutdown: () => void,
): void {
  registerEvents(pi, advisor, shutdown);
  registerTool(pi, advisor, signal);
  registerCommand(pi, advisor);
}
