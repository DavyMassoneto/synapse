import { ADVISOR_NAME } from "../host"
import { type AdvisorToolActivation } from "./types"

export function updateAdvisorTool(pi: AdvisorToolActivation, enabled: boolean): void {
  const active = pi.getActiveTools()
  if (enabled && !active.includes(ADVISOR_NAME)) {
    pi.setActiveTools([...active, ADVISOR_NAME])
  } else if (!enabled && active.includes(ADVISOR_NAME)) {
    const remaining = [...active]
    let index = remaining.indexOf(ADVISOR_NAME)
    while (index !== -1) {
      remaining.splice(index, 1)
      index = remaining.indexOf(ADVISOR_NAME)
    }
    pi.setActiveTools(remaining)
  }
}
