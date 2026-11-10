import { type ActiveModel, type Advisor } from "#synapse/modules"
import { type AdvisorContext } from "../host-context"
import { ADVISOR_NAME } from "../tool"
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

function showStatus(context: AdvisorContext, model: ActiveModel): void {
  if (model.kind === "active") {
    context.ui.setStatus(ADVISOR_NAME, `${STATUS_PREFIX}${model.model}`)
  } else {
    context.ui.setStatus(ADVISOR_NAME, undefined)
  }
}

export function syncAdvisor(pi: AdvisorToolActivation, advisor: Advisor, context: AdvisorContext): void {
  const model = advisor.activeModel()
  if (model.kind === "active") {
    activateTool(pi)
  } else {
    deactivateTool(pi)
  }
  if (context.hasUI) {
    showStatus(context, model)
  }
}
