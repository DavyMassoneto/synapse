import { ADVISOR_NAME } from "#synapse/integration/pi/advisor/constants";
import { type AdvisorToolActivation } from "./types.ts";

function isOtherTool(name: string): boolean {
  return name !== ADVISOR_NAME;
}

export function updateAdvisorTool(pi: AdvisorToolActivation, enabled: boolean): void {
  const active = pi.getActiveTools();
  if (enabled && !active.includes(ADVISOR_NAME)) {
    pi.setActiveTools([...active, ADVISOR_NAME]);
  } else if (!enabled && active.includes(ADVISOR_NAME)) {
    pi.setActiveTools(active.filter(isOtherTool));
  }
}
