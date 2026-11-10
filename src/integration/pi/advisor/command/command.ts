import { type Advisor, type AdvisorResult, type Config } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { type AdvisorToolActivation, syncAdvisor } from "../lifecycle"
import { chooseModel, type ModelSelection } from "../model-picker"
import { COMMAND_TEXT } from "./constants"
import { currentModel } from "./current-model"
import { parseAdvisorCommand } from "./parser"
import { type AdvisorCommandInput } from "./types"

export class AdvisorCommand {
  private readonly pi: AdvisorToolActivation
  private readonly advisor: Advisor

  constructor(pi: AdvisorToolActivation, advisor: Advisor) {
    this.pi = pi
    this.advisor = advisor
  }

  async handle(args: string, context: AdvisorContext): Promise<void> {
    const status = this.advisor.configuration.status()
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error")
    } else {
      await this.execute(parseAdvisorCommand(args), status.config, context)
    }
  }

  private async execute(input: AdvisorCommandInput, config: Config, context: AdvisorContext): Promise<void> {
    if (input.kind === "disable") {
      this.disable(context)
    } else if (input.kind === "thinking") {
      this.report(context, this.advisor.configuration.setThinking(input.level), `Advisor thinking: ${input.level}`)
    } else if (input.query.length === 0 && !context.hasUI) {
      context.ui.notify(`Advisor: ${currentModel(config)}, thinking ${config.thinking}`, "info")
    } else {
      this.applySelection(context, await chooseModel(context, input.query))
    }
  }

  private applySelection(context: AdvisorContext, selection: ModelSelection): void {
    if (selection.kind === "disabled") {
      this.disable(context)
    } else if (selection.kind === "selected") {
      this.report(context, this.advisor.configuration.selectModel(selection.model), `Advisor: ${selection.model}`)
    }
  }

  private disable(context: AdvisorContext): void {
    this.report(context, this.advisor.configuration.disable(), COMMAND_TEXT.disabled)
  }

  private report(context: AdvisorContext, result: AdvisorResult, success: string): void {
    if (result.kind === "failure") {
      context.ui.notify(result.message, "error")
    } else {
      syncAdvisor(this.pi, this.advisor, context)
      context.ui.notify(success, "info")
    }
  }
}
