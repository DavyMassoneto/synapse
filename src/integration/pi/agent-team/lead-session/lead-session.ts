import { PiTeamLeadContext } from "./lead-context"
import { PiTeamLeadModel } from "./lead-model"
import { PiTeamLeadOutput } from "./lead-output"
import { type AgentTeamLeadHost, type PiTeamLeadSession } from "./types"

export function createPiTeamLeadSession(pi: AgentTeamLeadHost): PiTeamLeadSession {
  const context = new PiTeamLeadContext()
  const model = new PiTeamLeadModel(context)
  const output = new PiTeamLeadOutput(pi)
  return {
    attach: context.attach.bind(context),
    detach: model.detach.bind(model),
    context: context.context.bind(context),
    show: context.show.bind(context),
    isRunning: context.isRunning.bind(context),
    reportFailure: context.reportFailure.bind(context),
    modelUse: model.modelUse.bind(model),
    recordMessage: model.recordMessage.bind(model),
    deliver: output.deliver.bind(output),
    recordTask: output.recordTask.bind(output),
    recordMember: output.recordMember.bind(output),
  }
}
