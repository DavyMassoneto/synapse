import type { Advisor } from "#synapse/modules";
import type { AdvisorHost, AdvisorShutdownHandler } from "../contracts";
import { beforeStart } from "./before-start";
import { toolResult } from "./tool-result";
import { turnEnd } from "./turn-end";

export function registerEvents(
  pi: AdvisorHost,
  advisor: Advisor,
  shutdownCallback: AdvisorShutdownHandler,
): void {
  pi.on("session_shutdown", shutdownCallback);
  pi.on("before_agent_start", beforeStart.bind(undefined, pi, advisor));
  pi.on("tool_result", toolResult.bind(undefined, advisor));
  pi.on("turn_end", turnEnd.bind(undefined, advisor));
}
