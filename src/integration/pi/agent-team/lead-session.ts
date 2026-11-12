import { PiTeamLeadContext } from "./lead-context"
import { PiTeamLeadHistory } from "./lead-history"
import { PiTeamLeadModel } from "./lead-model"
import { type AgentTeamLeadHost, type PiTeamLeadSession } from "./types"

export function createPiTeamLeadSession(pi: AgentTeamLeadHost): PiTeamLeadSession {
  const context = new PiTeamLeadContext()
  const model = new PiTeamLeadModel(context)
  const history = new PiTeamLeadHistory(pi)
  return {
    attach: context.attach.bind(context),
    detach: model.detach.bind(model),
    context: context.context.bind(context),
    show: context.show.bind(context),
    isRunning: context.isRunning.bind(context),
    reportFailure: context.reportFailure.bind(context),
    modelUse: model.modelUse.bind(model),
    recordMessage: model.recordMessage.bind(model),
    deliver: history.deliver.bind(history),
    recordTask: history.recordTask.bind(history),
    recordMember: history.recordMember.bind(history),
  }
}
