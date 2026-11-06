import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCommand, registerEvents, registerTool } from "@/integration";
import type { Advisor } from "@/modules";

export function registerAdvisor(pi: ExtensionAPI, advisor: Advisor): void {
  const lifetime = new AbortController();
  registerEvents(pi, advisor, lifetime);
  registerTool(pi, advisor, lifetime);
  registerCommand(pi, advisor);
}
