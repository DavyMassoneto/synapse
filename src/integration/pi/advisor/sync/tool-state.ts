import { ADVISOR_NAME } from "@/integration/pi/advisor/identifiers";
import { type AdvisorToolActivation } from "./types.ts";

export function updateAdvisorTool(pi: AdvisorToolActivation, enabled: boolean): void {
  const active = pi.getActiveTools();
  if (enabled && !active.includes(ADVISOR_NAME)) {
    pi.setActiveTools([...active, ADVISOR_NAME]);
  } else if (!enabled && active.includes(ADVISOR_NAME)) {
    const remaining: string[] = [];
    for (const name of active) {
      if (name !== ADVISOR_NAME) {
        remaining.push(name);
      }
    }
    pi.setActiveTools(remaining);
  }
}
