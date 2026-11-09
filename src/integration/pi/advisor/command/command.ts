import { type Advisor } from "#synapse/modules"
import { type AdvisorContext, type AdvisorHost } from "../contracts"
import { applySelection } from "./apply-selection"
import { applyThinking } from "./apply-thinking"
import { chooseModel } from "./choose-model"
import { currentModel } from "./current-model"
import { parseAdvisorCommand } from "./parser"

export class AdvisorCommand {
  private readonly pi: AdvisorHost
  private readonly advisor: Advisor

  constructor(pi: AdvisorHost, advisor: Advisor) {
    this.pi = pi
    this.advisor = advisor
  }

  async handle(args: string, context: AdvisorContext): Promise<void> {
    const status = this.advisor.configuration.status()
    const input = parseAdvisorCommand(args)
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error")
      return
    }
    if (input.kind === "disable") {
      applySelection(this.pi, this.advisor, context, { kind: "disabled" })
      return
    }
    if (input.kind === "thinking") {
      applyThinking(this.pi, this.advisor, context, input.level)
      return
    }
    if (!input.query && !context.hasUI) {
      context.ui.notify(`Advisor: ${currentModel(status.config)}, thinking ${status.config.thinking}`, "info")
      return
    }
    const chosen = await chooseModel(context, input.query)
    applySelection(this.pi, this.advisor, context, chosen)
  }
}
