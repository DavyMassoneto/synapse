import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCommand } from "@/integration/pi/command.ts";
import { registerEvents } from "@/integration/pi/events.ts";
import { registerTool } from "@/integration/pi/tool.ts";
import type { Advisor } from "@/modules/advisor/public/contracts.ts";

export function registerAdvisor(pi: ExtensionAPI, advisor: Advisor): void {
  const lifetime = new AbortController();
  registerEvents(pi, advisor, lifetime);
  registerTool(pi, advisor, lifetime);
  registerCommand(pi, advisor);
}
