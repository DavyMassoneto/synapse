import { type AdvisorToolActivation } from "./types.ts";

export function updateAdvisorTool(pi: AdvisorToolActivation, enabled: boolean): void {
  const active = pi.getActiveTools();
  if (enabled && !active.includes("advisor")) {
    pi.setActiveTools([...active, "advisor"]);
  } else if (!enabled && active.includes("advisor")) {
    const remaining: string[] = [];
    for (const name of active) {
      if (name !== "advisor") {
        remaining.push(name);
      }
    }
    pi.setActiveTools(remaining);
  }
}
