import { ADVISOR_NAME } from "../host"
import { type AdvisorToolActivation } from "./types"

export function setAdvisorToolEnabled(pi: AdvisorToolActivation, enabled: boolean): void {
  const active = pi.getActiveTools()
  const isActive = active.includes(ADVISOR_NAME)
  if (enabled && !isActive) {
    pi.setActiveTools([...active, ADVISOR_NAME])
  }
  if (!enabled && isActive) {
    pi.setActiveTools(active.filter((name) => name !== ADVISOR_NAME))
  }
}
