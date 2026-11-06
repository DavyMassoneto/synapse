import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCommand, registerEvents, registerTool } from "@/integration";
import { type Advisor } from "@/modules";

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
