import { type Advisor, type AdvisorResult } from "#synapse/modules"
import { ADVISOR_NAME, type AdvisorContext } from "../host"
import { STATUS_PREFIX } from "./constants"
import { type AdvisorToolActivation } from "./types"

function activateTool(pi: AdvisorToolActivation): void {
  const active = pi.getActiveTools()
  if (!active.includes(ADVISOR_NAME)) {
    pi.setActiveTools([...active, ADVISOR_NAME])
  }
}

function deactivateTool(pi: AdvisorToolActivation): void {
  const active = pi.getActiveTools()
  if (active.includes(ADVISOR_NAME)) {
    pi.setActiveTools(active.filter((name) => name !== ADVISOR_NAME))
  }
}

function showStatus(context: AdvisorContext, status: AdvisorResult): void {
  if (status.kind === "success" && status.config.model) {
    context.ui.setStatus(ADVISOR_NAME, `${STATUS_PREFIX}${status.config.model}`)
  } else {
    context.ui.setStatus(ADVISOR_NAME, undefined)
  }
}

export function syncAdvisor(pi: AdvisorToolActivation, advisor: Advisor, context: AdvisorContext): void {
  if (advisor.isEnabled()) {
    activateTool(pi)
  } else {
    deactivateTool(pi)
  }
  if (context.hasUI) {
    showStatus(context, advisor.configuration.status())
  }
}
